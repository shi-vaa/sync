import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbisModule } from 'abis/abis.module';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { EventsController } from './events.controller';
import { EventSchema } from './events.schema';
import { EventsService } from './events.service';

@Module({
  imports: [
    AbisModule,
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    UserModule,
    ProjectModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, ProjectService, UserService],
  exports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    EventsModule,
  ],
})
export class EventsModule {}
