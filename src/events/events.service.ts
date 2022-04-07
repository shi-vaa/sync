import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { BigNumber, ethers, utils } from 'ethers';
import axios from 'axios';

import { getWeb3 } from 'utils/web3';
import { EventDocument } from './events.schema';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import SaleAbi from 'abis/sale.json';
import { IEventsSync } from 'utils/interfaces/eventsSync';

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

    txnReceipt.logs
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
      })
      .map(async (each) => {
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

          await model.updateOne(
            { 'data.blockNumber': each.blockNumber },
            { $set: { data: each } },
            { upsert: true },
          );

          await this.sendEventToWebHookUrl(each, webhookUrl);
        } catch (err) {
          console.error(err.message);
        }
      });
  }

  async getAllEvents() {
    return this.eventsModel.find();
  }

  async syncEvents() {
    const events = await this.getAllEvents();
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC,
    );
    provider.on('error', (err) => console.error(err));

    events.forEach(async (event) => {
      const contract = new ethers.Contract(
        event.contract_address,
        [event.topic],
        provider,
      );

      const project = await this.projectService.findByProjectId(
        event.projectId.toString(),
      );

      const ethNftInterface = new ethers.utils.Interface([event.topic]);

      if (!project) {
        throw new Error(Messages.ProjectNotFound);
      }

      const fragment = ethNftInterface.getEventTopic(event.name);
      let listedEvents = await contract.queryFilter(fragment as any);

      listedEvents.map(async (listedEvent) => {
        await this.createEventsCollectionFromProjectEvents(
          listedEvent.transactionHash,
          event.abi,
          event.contract_address,
          event.projectId.toString(),
          event.webhook_url,
        );
      });
    });
  }

  async findByEventName(name: string) {
    return this.eventsModel.findOne({ name });
  }

  async attachAllEventListeners(contract: ethers.Contract) {
    const events = await this.getAllEvents();

    events.forEach(async (event) => {
      contract.on(event.name, (...args) => {
        console.log(args);
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
  }

  async sendEventToWebHookUrl(data: any, url: string) {
    return axios.post(url, { data });
  }

  formatLogs(data: object, txnHash: string, blockNumber: number) {
    return {
      ...data,
      txnHash,
      blockNumber,
    } as IEventsSync;
  }
}
