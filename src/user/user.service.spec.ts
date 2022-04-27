import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from './user.service';
import { ProjectModule } from 'project/project.module';
import { UserModule } from './user.module';
import { ProjectService } from 'project/project.service';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        forwardRef(() => ProjectModule),
        forwardRef(() => EventsModule),
        LoggerModule,
        UserModule,
      ],
      providers: [
        UserService,
        ProjectService,
        EventsService,
        PinoLoggerService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
