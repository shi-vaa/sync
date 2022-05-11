import { Module } from '@nestjs/common';
import { ApiKeysModule } from 'api-keys/api-keys.module';
import { ApiKeysService } from 'api-keys/api-keys.service';
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
  imports: [
    EventsModule,
    UserModule,
    ProjectModule,
    ApiKeysModule,
    LoggerModule,
  ],
  providers: [
    NftService,
    EventsService,
    UserService,
    ProjectService,
    ApiKeysService,
    PinoLoggerService,
  ],
  controllers: [NftController],
})
export class NftModule {}
