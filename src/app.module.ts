import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';

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
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ConfigurationModule,
    PassportModule,
    JwtModule.register({ secret: process.env.TOKEN_SECRET }),
    UserModule,
    AuthModule,
    ProjectModule,
    EventsModule,
    UtilsModule,
  ],
  controllers: [AppController, AuthController, ProjectController],
  providers: [
    AppService,
    AuthService,
    UserService,
    ProjectService,
    EventsService,
  ],
  exports: [AppModule],
})
export class AppModule {}
