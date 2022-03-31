import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers, utils } from 'ethers';

import { getWeb3 } from 'utils/web3';
import { EventDocument } from './events.schema';
import { ProjectService } from 'project/project.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Event') private readonly eventsModel: Model<EventDocument>,
    private readonly projectService: ProjectService,
  ) {}

  async createEventsCollectionFromProjectEvents(
    txnHash: string,
    event: EventDocument,
    projectName: string,
  ) {
    const { polygonWeb3 } = await getWeb3();
    const result = await polygonWeb3.eth.getTransactionReceipt(txnHash);
    const ethNftInterface = new ethers.utils.Interface([...event.abi]);

    const query = result.logs
      .filter(
        (each) =>
          each.address.toLowerCase() === event.contract_address.toLowerCase(),
      )
      .map((each) => ethNftInterface.parseLog(each))
      .map((each) => console.log('from txn receipts: ', each));
  }

  async getAllEvents() {
    return this.eventsModel.find();
  }

  async test(contract_address: string, abi: object) {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/mumbai',
    );

    // const ERC20_ABI = [
    //   'event Listed(address nft, uint256 nftId, address seller, uint256 price)',
    // ];

    // const address = '0xD68603215c4646386d2e0bE68a38027CE4a7652d';
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

    return listedEvents;
  }
}
