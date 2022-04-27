import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';

import { ProjectModule } from 'project/project.module';
import { ProjectDocument } from 'project/project.schema';
import { ProjectService } from 'project/project.service';
import { env } from 'types/env';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { configureProvider, createContract } from 'utils/helper';
import { IEventsSync } from 'utils/interfaces/eventsSync';
import { EventsModule } from './events.module';
import { EventsService } from './events.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ethers } from 'ethers';

describe('EventsService', () => {
  let service: EventsService;
  let projectService: ProjectService;
  let project: ProjectDocument;
  const projectName = 'project-1';
  const eventsContractAddress = '0xD68603215c4646386d2e0bE68a38027CE4a7652d';
  const nftsContractAddress = '0xb0dccfd131fa98e42d161bea10b034fcba40adae';
  const eventsCollectionName = `${projectName}_${eventsContractAddress}`;
  const nftsCollectionName = `${projectName}_${nftsContractAddress}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        EventsModule,
        // MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
        UserModule,
        LoggerModule,
        ProjectModule,
      ],
      providers: [
        EventsService,
        ProjectService,
        UserService,
        PinoLoggerService,
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    projectService = module.get<ProjectService>(ProjectService);

    project = await projectService.findByProjectName(projectName);

    if (!project) {
      project = await projectService.create(
        projectName,
        env.testNet,
        [
          'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/m…',
        ],
        'test project',
      );

      await projectService.addEvent(
        'Listed',
        'event Listed(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
        project['_id'].toString(),
        80001,
        'http://localhost:8000/webhook',
        eventsContractAddress,
        [
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'contract IERC721',
                name: 'nft',
                type: 'address',
              },
              {
                indexed: true,
                internalType: 'uint256',
                name: 'nftId',
                type: 'uint256',
              },
              {
                indexed: true,
                internalType: 'address',
                name: 'seller',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
              },
            ],
            name: 'Listed',
            type: 'event',
          },
        ],
      );
    }
  });

  // beforeAll(async () => {
  //   project = await projectService.findByProjectName(projectName);

  //   if (!project) {
  //     project = await projectService.create(
  //       projectName,
  //       env.testNet,
  //       [
  //         'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/m…',
  //       ],
  //       'test project',
  //     );

  //     await projectService.addEvent(
  //       'Delisted',
  //       'event Delisted(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
  //       project['_id'].toString(),
  //       80001,
  //       'http://localhost:8000/webhook',
  //       contractAddress,
  //       [
  //         {
  //           anonymous: false,
  //           inputs: [
  //             {
  //               indexed: true,
  //               internalType: 'contract IERC721',
  //               name: 'nft',
  //               type: 'address',
  //             },
  //             {
  //               indexed: true,
  //               internalType: 'uint256',
  //               name: 'nftId',
  //               type: 'uint256',
  //             },
  //             {
  //               indexed: true,
  //               internalType: 'address',
  //               name: 'seller',
  //               type: 'address',
  //             },
  //             {
  //               indexed: false,
  //               internalType: 'uint256',
  //               name: 'price',
  //               type: 'uint256',
  //             },
  //           ],
  //           name: 'Delisted',
  //           type: 'event',
  //         },
  //       ],
  //     );

  //     await projectService.addEvent(
  //       'Listed',
  //       'event Listed(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
  //       project['_id'].toString(),
  //       80001,
  //       'http://localhost:8000/webhook',
  //       contractAddress,
  //       [
  //         {
  //           anonymous: false,
  //           inputs: [
  //             {
  //               indexed: true,
  //               internalType: 'contract IERC721',
  //               name: 'nft',
  //               type: 'address',
  //             },
  //             {
  //               indexed: true,
  //               internalType: 'uint256',
  //               name: 'nftId',
  //               type: 'uint256',
  //             },
  //             {
  //               indexed: true,
  //               internalType: 'address',
  //               name: 'seller',
  //               type: 'address',
  //             },
  //             {
  //               indexed: false,
  //               internalType: 'uint256',
  //               name: 'price',
  //               type: 'uint256',
  //             },
  //           ],
  //           name: 'Listed',
  //           type: 'event',
  //         },
  //       ],
  //     );
  //   }
  // });

  // afterAll(async () => {
  //   await projectService.removeProject('project-1');
  // });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sync events', async () => {
    const firstBlockNumber = 25385681;
    let model;
    try {
      await mongoose
        .connect(process.env.MONGO_URI)
        .catch((err) => console.error(err));

      const schema = new mongoose.Schema({
        data: { type: Object },
      });

      if (mongoose.models[`${eventsCollectionName}`]) {
        model = mongoose.model<IEventsSync>(eventsCollectionName);
      } else {
        model = mongoose.model<IEventsSync>(
          eventsCollectionName,
          schema,
          eventsCollectionName,
        );
      }

      await service.syncEvents();

      const latestSyncedBlockInDb = await model
        .find()
        .sort({ 'data.blockNumber': -1 })
        .limit(1);

      const ethNftInterface = new ethers.utils.Interface([
        'event Listed(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
      ]);

      const provider = configureProvider(project.rpcs[0]);
      const contract = createContract(
        eventsContractAddress,
        'event Listed(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
        provider,
      );
      const fragment = ethNftInterface.getEventTopic('Listed');
      const listOfEvents = await contract.queryFilter(
        fragment as any,
        0,
        'latest',
      );

      listOfEvents.sort((a, b) => a.blockNumber - b.blockNumber);
      const firstBlock = listOfEvents[0];
      const lastBlock = listOfEvents[listOfEvents.length - 1];
      console.log(firstBlock.blockNumber, '\n', lastBlock.blockNumber);

      expect(firstBlock.blockNumber).toBe(firstBlockNumber);
      expect(lastBlock.blockNumber).toBe(latestSyncedBlockInDb.data.blockNumber);
    } catch (err) {
      console.error(err.message);
    }
  });

  // it('should not sync events if already synced', async () => {});

  it('should fetch NFTs', async () => {
    let model;
    try {
      await mongoose
        .connect(process.env.MONGO_URI)
        .catch((err) => console.error(err));

      const schema = new mongoose.Schema({
        data: { type: Object },
      });

      if (mongoose.models[`${eventsCollectionName}`]) {
        model = mongoose.model<IEventsSync>(eventsCollectionName);
      } else {
        model = mongoose.model<IEventsSync>(
          eventsCollectionName,
          schema,
          eventsCollectionName,
        );
      }

      await service.getNfts(
        nftsContractAddress,
        process.env.POLYGON_RPC,
        project['_id'],
        25846638,
      );

      const latestSyncedBlockInDb = await model
        .find()
        .sort({ 'data.blockNumber': -1 })
        .limit(1);
    } catch (err) {
      console.error(err.message);
    }
  });

  // it('should not fetch NFTs if already synced', async () => {});
});
