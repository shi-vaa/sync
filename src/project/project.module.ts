import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from 'user/user.service';
import { UserModule } from 'user/user.module';

import { ProjectController } from './project.controller';
import { ProjectSchema } from './project.schema';
import { ProjectService } from './project.service';
import { EventsService } from 'events/events.service';
import { EventsModule } from 'events/events.module';
import { EventSchema } from 'events/events.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, UserService],
  exports: [
    ProjectModule,
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
  ],
})
export class ProjectModule {}
