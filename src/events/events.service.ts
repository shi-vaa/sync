import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { ethers, utils } from 'ethers';
import axios from 'axios';

import { getWeb3 } from 'utils/web3';
import { EventDocument } from './events.schema';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { IEventsSync } from 'utils/interfaces/eventsSync';
import { createContract, configureProvider } from 'utils/helper';
import ERC721Abi from 'abis/ERC721.json';
import logger from 'main';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Event') private readonly eventsModel: Model<EventDocument>,
    @Inject(forwardRef(() => ProjectService))
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
          .catch((err) => logger.error(err));

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
          logger.warn('Already synced');
          continue;
        }

        const collection = new model({ data: { ...log } });
        await collection.save();

        const res = await this.sendEventToWebHookUrl(log, webhookUrl);
      } catch (err) {
        logger.error(err.message);
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

        provider.on('error', (err) => logger.error(err));

        await mongoose
          .connect(process.env.MONGO_URI)
          .catch((err) => logger.error(err));

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
            .catch((err) => logger.error(err));

          if (mongoose.models[`${collectionName}`]) {
            model = mongoose.model<IEventsSync>(collectionName);
          } else {
            model = mongoose.model<IEventsSync>(
              collectionName,
              schema,
              collectionName,
            );
          }

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
            logger.error(err.message);
          }
        } else {
          try {
            const fragment = ethNftInterface.getEventTopic(event.name);
            listedEvents = await contract.queryFilter(
              fragment as any,
              0,
              'latest',
            );
          } catch (err) {
            logger.error(err.message);
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

  async getNfts(
    contract_address: string,
    rpc: string,
    projectId: string,
    fromBlock: number,
  ) {
    const address = '0x0000000000000000000000000000000000000000';
    const listOfEvents = [];
    const project = await this.projectService.findByProjectId(projectId);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    try {
      const provider = configureProvider(rpc);
      const contract = createContract(
        contract_address,
        'event Transfer(address indexed from,address indexed to,uint256 value)',
        provider,
      );

      const ethNftInterface = new ethers.utils.Interface([...ERC721Abi.abi]);
      const fragment = ethNftInterface.getEventTopic('Transfer');
      const latest = await provider.getBlockNumber();

      for (let i = fromBlock; i < latest; i += 2000) {
        const fromBlock = i;
        const toBlock = Math.min(latest, i + 1999);
        const events = await contract.queryFilter(
          fragment as any,
          fromBlock,
          toBlock,
        );

        listOfEvents.push(...events);
      }

      for (const event of listOfEvents) {
        const { polygonWeb3 } = await getWeb3();
        const txnReceipt = await polygonWeb3.eth.getTransactionReceipt(
          event.transactionHash,
        );

        const abi = new polygonWeb3.eth.Contract(
          ERC721Abi.abi as any,
          contract_address,
        );

        const txnLogs = txnReceipt.logs.filter(
          (each) =>
            each.address.toLocaleLowerCase() === contract_address.toLowerCase(),
        );

        for (const log of txnLogs) {
          const parsedLog = ethNftInterface.parseLog(log);

          const metadata = await abi.methods
            .tokenURI(parsedLog.args.tokenId.toString())
            .call();

          const response = await axios.get(metadata);

          const formattedLog = {
            metadata: JSON.stringify(response.data),
            tokenId: parsedLog.args.tokenId.toString(),
            contract_address,
            blockNumber: log.blockNumber,
          };

          const isBurnEvent = parsedLog.args['to'] === address;
          const isMintEvent = parsedLog.args['from'] === address;

          if (!isBurnEvent && !isMintEvent) {
            continue;
          } else if (isBurnEvent) {
            formattedLog['owner_of'] = parsedLog.args.from;
          } else {
            formattedLog['owner_of'] = parsedLog.args.to;
          }

          const schema = new mongoose.Schema({
            data: { type: Object },
          });

          const collectionName = `${project.name}_${contract_address}`;

          let model;

          await mongoose
            .connect(process.env.MONGO_URI)
            .catch((err) => logger.error(err));

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
            'data.blockNumber': formattedLog.blockNumber,
          });

          if (eventLog) {
            logger.warn('Already added');
            continue;
          }

          const collection = new model({
            data: { ...formattedLog },
          });
          await collection.save();
        }
      }
    } catch (err) {
      logger.error(err.message);
    }
  }
}
