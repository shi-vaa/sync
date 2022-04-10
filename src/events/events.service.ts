import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import axios from 'axios';

import { getWeb3 } from 'utils/web3';
import { EventDocument } from './events.schema';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { IEventsSync } from 'utils/interfaces/eventsSync';
import { createContract, configureProvider } from 'utils/helper';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Event') private readonly eventsModel: Model<EventDocument>,
    private readonly projectService: ProjectService,
  ) {}

  async createEventsCollectionFromProjectEvents(
    txnHash: string,
    abi: string,
    contract_address: string,
    projectId: string,
    webhookUrl: string,
  ) {
    const { polygonWeb3 } = await getWeb3();
    const txnReceipt = await polygonWeb3.eth.getTransactionReceipt(txnHash);
    const ethNftInterface = new ethers.utils.Interface(JSON.parse(abi));

    const logs = txnReceipt.logs
      .filter(
        (each) => each.address.toLowerCase() === contract_address.toLowerCase(),
      )
      .map((each) => {
        const { args, name, eventFragment } = ethNftInterface.parseLog(each);

        const formattedArgs = {};
        eventFragment.inputs.forEach((fragment, index) => {
          const argName = fragment.name;
          if (fragment.type === 'uint256') {
            formattedArgs[argName] = args[index].toString();
          } else {
            formattedArgs[argName] = args[index];
          }
        });

        return this.formatLogs(
          { ...formattedArgs, name },
          each.transactionHash,
          each.blockNumber,
        );
      });

    for (const log of logs) {
      try {
        const project = await this.projectService.findByProjectId(projectId);

        const schema = new mongoose.Schema({
          data: { type: Object },
        });

        const collectionName = `${project.name}_${contract_address}`;

        let model;

        await mongoose
          .connect(process.env.MONGO_URI)
          .catch((err) => console.error(err));

        if (mongoose.models[`${collectionName}`]) {
          model = mongoose.model<IEventsSync>(collectionName);
        } else {
          model = mongoose.model<IEventsSync>(
            collectionName,
            schema,
            collectionName,
          );
        }

        const eventLog = await model.findOne({
          'data.blockNumber': log.blockNumber,
        });

        if (eventLog) {
          console.log('Already synced');
          continue;
        }

        const collection = new model({ data: { ...log } });
        await collection.save();

        const res = await this.sendEventToWebHookUrl(log, webhookUrl);
        console.log(res);
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  async getAllEvents() {
    return this.eventsModel.find();
  }

  async syncEvents() {
    const projects = await this.projectService.getAllProjects();

    for (const project of projects) {
      const provider = configureProvider(project.rpcs[0]);

      for (const eventId of project.event_ids) {
        const event = await this.findByEventId(eventId.toString());

        if (!event) {
          throw new Error(Messages.EventNotFound);
        }

        const ethNftInterface = new ethers.utils.Interface([event.topic]);
        const collectionName = `${project.name}_${event.contract_address}`;
        let listedEvents = [];

        provider.on('error', (err) => console.error(err));

        await mongoose
          .connect(process.env.MONGO_URI)
          .catch((err) => console.error(err));

        const conn = mongoose.connection;

        const contract = createContract(
          event.contract_address,
          event.topic,
          provider,
        );

        const collectionExists = await conn.db
          .collections()
          .then((arg) =>
            arg.find((coll) => coll.namespace.split('.')[1] === collectionName),
          );

        if (collectionExists) {
          const schema = new mongoose.Schema({
            data: { type: Object },
          });

          let model;

          await mongoose
            .connect(process.env.MONGO_URI)
            .catch((err) => console.error(err));

          if (mongoose.models[`${collectionName}`]) {
            model = mongoose.model<IEventsSync>(collectionName);
          } else {
            model = mongoose.model<IEventsSync>(
              collectionName,
              schema,
              collectionName,
            );
          }

          console.log(
            'duplicates',
            await model.aggregate([
              { $group: { _id: '$data.blockNumber', count: { $sum: 1 } } },
              { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
              { $project: { name: '$_id', _id: 0 } },
            ]),
          );

          const lastSyncedBlock = await model
            .find({ 'data.name': event.name })
            .sort({ 'data.blockNumber': -1 })
            .limit(1);

          const fragment = ethNftInterface.getEventTopic(event.name);

          try {
            if (lastSyncedBlock.length === 0) {
              const fragment = ethNftInterface.getEventTopic(event.name);
              listedEvents = await contract.queryFilter(fragment as any);
            } else {
              const latest = await provider.getBlockNumber();
              const latestInDb = lastSyncedBlock[0].data.blockNumber;

              for (let i = latestInDb; i < latest; i += 2000) {
                const fromBlock = i;
                const toBlock = Math.min(latest, i + 1999);
                const events = await contract.queryFilter(
                  fragment as any,
                  fromBlock,
                  toBlock,
                );

                listedEvents.push(...events);
              }
            }
          } catch (err) {
            console.error(err.message);
          }
        } else {
          try {
            const fragment = ethNftInterface.getEventTopic(event.name);
            listedEvents = await contract.queryFilter(fragment as any);
          } catch (err) {
            console.error(err.message);
          }
        }

        for (const listedEvent of listedEvents) {
          await this.createEventsCollectionFromProjectEvents(
            listedEvent.transactionHash,
            event.abi,
            event.contract_address,
            event.projectId.toString(),
            event.webhook_url,
          );
        }
      }
    }
  }

  async findByEventName(name: string) {
    return this.eventsModel.findOne({ name });
  }

  async attachAllEventListeners() {
    const projects = await this.projectService.getAllProjects();

    projects.forEach((project) => {
      const provider = configureProvider(project.rpcs[0]);

      project.event_ids.forEach(async (eventId) => {
        const event = await this.findByEventId(eventId.toString());

        if (!event) {
          throw new Error(Messages.EventNotFound);
        }

        const contract = createContract(
          event.contract_address,
          event.topic,
          provider,
        );

        contract.on(event.name, (...args) => {
          const transaction = args[args.length - 1];
          this.createEventsCollectionFromProjectEvents(
            transaction.transactionHash,
            event.abi,
            event.contract_address,
            event.projectId.toString(),
            event.webhook_url,
          );
        });
      });
    });
  }

  async sendEventToWebHookUrl(data: any, url: string) {
    const reqBody = JSON.stringify(data);
    return axios.post(url, { reqBody });
  }

  formatLogs(data: object, txnHash: string, blockNumber: number) {
    return {
      ...data,
      txnHash,
      blockNumber,
    } as IEventsSync;
  }

  async findByEventId(eventId: string): Promise<EventDocument> {
    return this.eventsModel.findById(eventId);
  }
}
