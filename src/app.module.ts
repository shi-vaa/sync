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
    ProjectModule,
    UtilsModule,
  ],
  controllers: [AppController, AuthController, ProjectController],
  providers: [
    PinoLoggerService,
    AppService,
    AuthService,
    UserService,
    ProjectService,
    EventsService,
  ],
  exports: [AppModule],
})
export class AppModule {}
