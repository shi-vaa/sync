import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { NewUserDTO } from '../user/dtos/new-user.dto';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from './decorators/roles.enum';
import { RolesGuard } from './decorators/roles.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ProjectService } from '../project/project.service';
import { AuthModule } from './auth.module';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let userService: UserService;

  let registeredUser;

  const mockAuthService = {
    register(user) {
      return user;
    },
  };

  const mockJwtService = {
    sign() {
      return 'mock-jwt-test-token';
    },
  };

  const mockProjectService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        AuthModule,
        UserModule,
        ProjectModule,
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        UserService,
        {
          provide: JwtGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ProjectService, useValue: mockProjectService },
        {
          provide: RolesGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await userService.deleteUserByWalletAddress(
      '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    try {
      registeredUser = await controller.register(newUser);

      expect(registeredUser.walletAddress).toBe(
        '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
      );
      expect(registeredUser.roles).toEqual([Role.Member]);
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should not register user, throw error', async () => {
    try {
      await controller.register(newUser);
    } catch (err) {
      expect(err.message).toBe('User already exists.');
    }
  });

  it('should login user', async () => {
    try {
      const response = await controller.login({
        walletAddress: '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
        roles: [Role.Member],
      });

      expect(response.token).toBeTruthy();
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should not login user, throw error', async () => {
    try {
      await controller.login({
        walletAddress: '0xB0DccFD131fA98E42d161bEa10B3FCba40',
        roles: [Role.Member],
      });
    } catch (err) {
      expect(err.message).toBe('User does not exist');
    }
  });
});

const newUser: NewUserDTO = {
  walletAddress: '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
  roles: [Role.Member],
};
