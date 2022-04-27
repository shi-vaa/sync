import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';

import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { EventSchema } from './events.schema';
import { EventsService } from './events.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    LoggerModule,
  ],
  providers: [EventsService, ProjectService, UserService, PinoLoggerService],
  exports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    EventsModule,
  ],
})
export class EventsModule {}
