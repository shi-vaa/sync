import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { ProjectModule } from 'project/project.module';
import { ProjectDocument } from 'project/project.schema';
import { ProjectService } from 'project/project.service';
import { env } from 'types/env';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { IEventsSync } from 'utils/interfaces/eventsSync';
import { EventSchema } from './events.schema';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let projectService: ProjectService;
  let project: ProjectDocument;
  const projectName = 'project-1';
  const contractAddress = '0xD68603215c4646386d2e0bE68a38027CE4a7652d';
  const collectionName = `${projectName}_${contractAddress}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
        // UserModule,
        ProjectModule,
      ],
      providers: [EventsService, ProjectService],
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
        'Delisted',
        'event Delisted(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
        project['_id'].toString(),
        80001,
        'http://localhost:8000/webhook',
        contractAddress,
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
            name: 'Delisted',
            type: 'event',
          },
        ],
      );

      await projectService.addEvent(
        'Listed',
        'event Listed(address indexed nft, uint256 indexed nftId, address indexed seller, uint256 price)',
        project['_id'].toString(),
        80001,
        'http://localhost:8000/webhook',
        contractAddress,
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
    const firstBlock = 25385681;
    let model;

    await mongoose
      .connect(process.env.MONGO_URI)
      .catch((err) => console.error(err));

    const schema = new mongoose.Schema({
      data: { type: Object },
    });

    if (mongoose.models[`${collectionName}`]) {
      model = mongoose.model<IEventsSync>(collectionName);
    } else {
      model = mongoose.model<IEventsSync>(
        collectionName,
        schema,
        collectionName,
      );
    }

    await service.syncEvents();
    const firstSyncedBlock = await model
      .find()
      .sort({ 'data.blockNumber': 1 })
      .limit(1);

    expect(firstSyncedBlock).toBeTruthy();
    expect(firstSyncedBlock.data.blockNumber).toBe(firstBlock);
    expect(firstSyncedBlock.data.name).toBe('Listed');
  });
});
