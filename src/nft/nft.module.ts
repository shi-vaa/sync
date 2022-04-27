import { Module } from '@nestjs/common';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { LoggerModule } from 'logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { UserModule } from 'user/user.module';
import { UserService } from 'user/user.service';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  imports: [EventsModule, UserModule, ProjectModule, LoggerModule],
  providers: [
    NftService,
    EventsService,
    UserService,
    ProjectService,
    PinoLoggerService,
  ],
  controllers: [NftController],
})
export class NftModule {}
