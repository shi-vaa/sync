import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ProjectService } from './project/project.service';
import { ProjectController } from './project/project.controller';
import { ProjectModule } from './project/project.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { EventsService } from './events/events.service';
import { EventsModule } from './events/events.module';
import { UtilsModule } from './utils/utils.module';
import { LoggerModule } from './logger/logger.module';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ContractModule } from './contract/contract.module';
import { NftController } from './nft/nft.controller';
import { NftService } from './nft/nft.service';
import { NftModule } from './nft/nft.module';
import { ContractService } from 'contract/contract.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    PassportModule,
    JwtModule.register({ secret: process.env.TOKEN_SECRET }),
    LoggerModule,
    EventsModule,
    UserModule,
    AuthModule,
    ContractModule,
    ProjectModule,
    UtilsModule,
    NftModule,
  ],
  controllers: [
    AppController,
    AuthController,
    ProjectController,
    NftController,
  ],
  providers: [
    PinoLoggerService,
    AppService,
    AuthService,
    UserService,
    ContractService,
    ProjectService,
    EventsService,
    NftService,
  ],
  exports: [AppModule],
})
export class AppModule {}
