import { Injectable } from '@nestjs/common';
import axios from 'axios';
import mongoose from 'mongoose';

import { PinoLoggerService } from 'logger/pino-logger.service';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { configureProvider, createContract } from 'utils/helper';
import ERC721Abi from 'abis/ERC721.json';
import { ethers } from 'ethers';
import { getWeb3 } from 'utils/web3';
import { IEventsSync } from 'utils/interfaces/eventsSync';

@Injectable()
export class NftService {
  constructor(
    private readonly projectService: ProjectService,
    private logger: PinoLoggerService,
  ) {}

  async getNfts(
    userId: string,
    projectId: string,
    contract_address: string,
    rpc: string,
    fromBlock: number,
  ) {
    const address = '0x0000000000000000000000000000000000000000';
    const listOfEvents = [];
    const project = await this.projectService.findByProjectId(projectId);
    const nfts = [];

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (!(await this.projectService.isUserPartOfProject(userId, projectId))) {
      throw new Error(Messages.NotAMember);
    }

    this.logger
      .logService(process.env.MONGO_URI)
      .info(`Fetching NFTs for contract: ${contract_address}`);

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
        const _fromBlock = i;
        const toBlock = Math.min(latest, i + 1999);
        const events = await contract.queryFilter(
          fragment as any,
          _fromBlock,
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
            .catch((err) =>
              this.logger.logService(process.env.MONGO_URI).error(err),
            );

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
            this.logger.logService(process.env.MONGO_URI).warn('Already added');
            continue;
          }

          const collection = new model({
            data: { ...formattedLog },
          });
          await collection.save();
          nfts.push(formattedLog);

        }
      }
    } catch (err) {
      this.logger.logService(process.env.MONGO_URI).error(err.message);
    }
    return nfts;
  }
}
