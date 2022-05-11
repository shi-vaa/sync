import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractSchema } from './contract.schema';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Contract', schema: ContractSchema }]),
    UserModule,
    ProjectModule,
    EventsModule,
    LoggerModule,
  ],
  providers: [
    ContractService,
    UserService,
    ProjectService,
    EventsService,
    PinoLoggerService,
  ],
  controllers: [ContractController],
  exports: [
    MongooseModule.forFeature([{ name: 'Contract', schema: ContractSchema }]),
  ],
})
export class ContractModule {}
