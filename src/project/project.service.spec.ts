import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from 'user/user.service';
import { UserModule } from 'user/user.module';
import { ProjectService } from './project.service';
import { ProjectSchema } from './project.schema';
import { EventSchema } from 'events/events.schema';
import { EventsModule } from 'events/events.module';
import { ProjectModule } from './project.module';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // MongooseModule.forFeature([
        //   { name: 'Project', schema: ProjectSchema },
        //   { name: 'Event', schema: EventSchema },
        // ]),
        MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
        ProjectModule,
        forwardRef(() => UserModule),
        EventsModule,
      ],
      providers: [ProjectService, UserService],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
