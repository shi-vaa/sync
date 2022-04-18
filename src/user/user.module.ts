import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { EventsService } from 'events/events.service';
import { EventsModule } from 'events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => ProjectModule),
    forwardRef(() => EventsModule),
  ],
  providers: [UserService, ProjectService, EventsService],

  exports: [
    UserModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
})
export class UserModule {}
