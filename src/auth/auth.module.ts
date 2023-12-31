import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './decorators/roles.guard';
import { UserService } from 'user/user.service';
import { ProjectService } from 'project/project.service';
import { ProjectModule } from 'project/project.module';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { LoggerModule } from 'logger/logger.module';
import { ContractModule } from 'contract/contract.module';
import { ContractService } from 'contract/contract.service';

@Module({
  imports: [
    LoggerModule,
    UserModule,
    EventsModule,
    ProjectModule,
    ContractModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.TOKEN_SECRET }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    ProjectService,
    ContractService,
    JwtGuard,
    JwtStrategy,
    RolesGuard,
    EventsService,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
