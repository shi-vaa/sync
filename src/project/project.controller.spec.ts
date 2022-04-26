import { forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import httpMocks from 'node-mocks-http';

import { Role } from 'auth/decorators/roles.enum';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { ProjectController } from './project.controller';
import { ProjectModule } from './project.module';
import { ProjectService } from './project.service';
import { env } from 'types/env';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;
  let userService: UserService;
  let mockUser;

  const mockRequest = httpMocks.createRequest();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        forwardRef(() => EventsModule),
        forwardRef(() => UserModule),
        LoggerModule,
        ProjectModule,
      ],
      controllers: [ProjectController],
      providers: [
        ProjectService,
        UserService,
        EventsService,
        PinoLoggerService,
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
    userService = module.get<UserService>(UserService);

    mockRequest.user = await userService.findByWalletAddress(
      '83rhekajfnkjadsbfaiudhfi',
    );

    // await userService.create('0xB0DccFD131fA98E42d161bEa10B3FCba40ANjdI', [
    //   Role.Member,
    // ]);

    mockUser = await userService.findByWalletAddress(
      '0xB0DccFD131fA98E42d161bEa10B3FCba40ANjdI',
    );
  });

  // afterAll(async () => {
  //   await userService.deleteUserByWalletAddress(
  //     '0xB0DccFD131fA98E42d161bEa10B3FCba40ANjdI',
  //   );
  // });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create project', async () => {
    try {
      const response = await controller.create({
        name: 'test-project-1',
        env: env.testNet,
        rpcs: ['test-rpc'],
        description: 'test',
      });

      console.log(response);
    } catch (err) {
      console.error(err.message);
    }
  });

  //   it('should throw error when project exists; not create project', async () => {
  //     try {
  //       await controller.create({ name: 'test-project-1' }, mockRequest);
  //     } catch (err) {
  //       expect(err.message).toBe('Project already exisits');
  //     }
  //   });

  //   it('should add member to project', async () => {
  //     try {
  //       controller.addMember(
  //         { projectId: mockProject['_id'], memberId: mockUser.id },
  //         mockRequest,
  //       );
  //     } catch (err) {
  //       console.error(err.message);
  //     }
  //   });

  //   it('should throw error when user does not exist', async () => {
  //     try {
  //       controller.addMember(
  //         {
  //           projectId: mockProject['_id'],
  //           memberId: mockProject['_id'],
  //         },
  //         mockRequest,
  //       );
  //     } catch (err) {
  //       expect(err.message).toBe('User does not exist');
  //     }
  //   });
});
