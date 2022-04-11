import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { EventSchema } from './events.schema';
import { EventsService } from './events.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    UserModule,
    ProjectModule,
  ],
  providers: [EventsService, ProjectService, UserService],
  exports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    EventsModule,
  ],
})
export class EventsModule {}
