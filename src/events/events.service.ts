import { Injectable } from '@nestjs/common';
import {
  InjectModel,
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers, utils } from 'ethers';

import { getWeb3 } from 'utils/web3';
import { EventDocument } from './events.schema';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import mongoose from 'mongoose';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Event') private readonly eventsModel: Model<EventDocument>,
    private readonly projectService: ProjectService,
  ) {}

  async createEventsCollectionFromProjectEvents(
    txnHash: string,
    // event: EventDocument,
    abi: any,
    contract_address: string,
    projectName: string,
  ) {
    const { polygonWeb3 } = await getWeb3();
    const txnReceipt = await polygonWeb3.eth.getTransactionReceipt(txnHash);
    const ethNftInterface = new ethers.utils.Interface([...abi]);

    const query = txnReceipt.logs
      .filter(
        (each) => each.address.toLowerCase() === contract_address.toLowerCase(),
      )
      // .map((each) => ethNftInterface.parseLog(each))
      .map(async (each) => {
        const schema = new mongoose.Schema({
          logs: { type: Object, required: true },
        });

        const collectionName = `${projectName}_${contract_address}`;

        let model;

        await mongoose
          .connect(process.env.MONGO_URI)
          .then(() => console.log('connected'))
          .catch((err) => console.error(err));

        if (mongoose.models[`${collectionName}`]) {
          model = mongoose.model(collectionName);
        } else {
          model = mongoose.model(collectionName, schema);
        }

        const collection = new model({ logs: each });
        await collection.save();
      });
  }

  async getAllEvents() {
    return this.eventsModel.find();
  }

  async test(contract_address: string, abi: object, projectName: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/mumbai',
    );

    const contract = new ethers.Contract(
      contract_address,
      abi as any,
      provider,
    );

    const filter = {
      address: contract_address,
      topics: [utils.id('Listed(address,uint256,address,uint256)')],
    };

    const block = await provider.getBlockNumber();

    provider.on(filter, (log) => {
      console.log(log);
    });

    provider.on('error', (err) => console.error(err));

    const listedEvents = await contract.queryFilter('Listed' as any);

    const { polygonWeb3 } = await getWeb3();

    const project = await this.projectService.findByProjectName(projectName);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    // listedEvents.map(async (event) => {
    //   const result = await polygonWeb3.eth.getTransactionReceipt(
    //     event.transactionHash,
    //   );
    //   console.log(
    //     'receipt: ',
    //     result.logs.filter((log) => log.address === contract_address),
    //   );
    // });

    listedEvents.map(async (event) => {
      await this.createEventsCollectionFromProjectEvents(
        event.transactionHash,
        abi,
        contract_address,
        projectName,
      );
    });

    return listedEvents;
  }
}
