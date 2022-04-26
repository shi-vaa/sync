import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from 'user/user.service';
import { UserModule } from 'user/user.module';
import { ProjectService } from './project.service';
import { EventSchema } from 'events/events.schema';
import { EventsModule } from 'events/events.module';
import { ProjectModule } from './project.module';
import { EventsService } from 'events/events.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ConfigModule } from '@nestjs/config';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProjectModule,
        // MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        forwardRef(() => UserModule),
        forwardRef(() => EventsModule),
        LoggerModule,
      ],
      providers: [
        ProjectService,
        UserService,
        EventsService,
        PinoLoggerService,
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
