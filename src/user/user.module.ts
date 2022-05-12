import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { EventsService } from 'events/events.service';
import { EventsModule } from 'events/events.module';
import { LoggerModule } from 'logger/logger.module';
import { UserController } from './user.controller';
import { ContractModule } from 'contract/contract.module';
import { ContractService } from 'contract/contract.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => ProjectModule),
    forwardRef(() => EventsModule),
    forwardRef(() => ContractModule),
    LoggerModule,
  ],
  providers: [UserService, ProjectService, EventsService, ContractService],

  exports: [
    UserModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],

  controllers: [UserController],
})
export class UserModule {}
