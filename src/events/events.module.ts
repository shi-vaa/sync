import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule } from 'configuration/configuration.module';
import logger from 'configuration/logger';
import { LoggerModule } from 'nestjs-pino';

import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { EventSchema } from './events.schema';
import { EventsService } from './events.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
  ],
  providers: [EventsService, ProjectService, UserService],
  exports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    EventsModule,
  ],
})
export class EventsModule {}
