import { forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import httpMocks from 'node-mocks-http';

import { Role } from '../auth/decorators/roles.enum';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { ProjectController } from './project.controller';
import { ProjectModule } from './project.module';
import { ProjectService } from './project.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;
  let userService: UserService;

  const mockRequest = httpMocks.createRequest();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        forwardRef(() => UserModule),
        ProjectModule,
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
      ],
      controllers: [ProjectController],
      providers: [ProjectService, UserService],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
    userService = module.get<UserService>(UserService);

    mockRequest.user = await userService.findByWalletAddress(
      '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create project', async () => {
    try {
      const response = await controller.create(
        { name: 'test-project-1', description: 'test' },
        mockRequest,
      );

      expect(response.members).toEqual([mockRequest.user._id.toString()]);
      expect(response.admins).toEqual([mockRequest.user._id.toString()]);
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should throw error when project exists', async () => {
    try {
      await controller.create({ name: 'test-project-1' }, mockRequest);
    } catch (err) {
      expect(err.message).toBe('Project already exisits');
    }
  });

  it('should add member to project', async () => {
    try {
      const member = await userService.create(
        '0xB0DccFD131fA98E42d161bEa10B3FCba40ANjdI',
        [Role.Member],
      );

      const mockProject = await service.create(
        mockRequest.user._id,
        'test-project-2',
      );

      controller.addMember(
        { projectId: mockProject['_id'], memberId: member._id },
        mockRequest,
      );
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should throw error when user does not exist', async () => {
    try {
      mockRequest.invalidTestUser = await userService.findByWalletAddress('');

      const mockProject = await service.create(
        mockRequest.user._id,
        'test-project-3',
      );

      controller.addMember(
        {
          projectId: mockProject['_id'],
          memberId: mockRequest.invalidTestUser._id,
        },
        mockRequest,
      );
    } catch (err) {
      console.error(err.message);
    }
  });

  // it('should throw error when user is unauthenticated; not create project');
  // it('should throw error when user does not exist');
  // it('should throw error when user is unauthenticated; not add user');
  // it('should throw error when user is not admin');

  // it('should fetch project details');
  // it(
  //   'should throw error when user is unauthenticated; not fetch project details',
  // );
  // it('should throw error when user does not exist');
  // it('should throw error when project does not exist');
  // it('should throw error when user is not member of project');

  // it('should remove project');
  // it('should throw error when user is not admin, not remove project');
});
