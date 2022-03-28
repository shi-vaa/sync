import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { ProjectService } from './project.service';
import { ProjectModule } from './project.module';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        forwardRef(() => UserModule),
        ProjectModule,
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
      ],
      providers: [ProjectService, UserService],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
