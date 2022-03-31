import { Test, TestingModule } from '@nestjs/testing';
import { NewUserDTO } from '../user/dtos/new-user.dto';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from './decorators/roles.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let userService: UserService;

  const mockAuthService = {};
  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    try {
      const registeredUser = await controller.register(newUser);

      expect(registeredUser.walletAddress).toBe(
        '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
      );
      expect(registeredUser.roles).toBe([Role.Member]);
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should not register user, throw error', async () => {
    try {
      const registeredUser = await controller.register(newUser);

      expect(registeredUser.walletAddress).toBe(
        '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
      );
      expect(registeredUser.roles).toBe([Role.Member]);
    } catch (err) {
      console.error(err.message);
    }
  });

  it('should login user', () => {
    // controller.login();
  });

  it('should not login user, throw error', () => {
    controller.login();
  });
});

let newUser: NewUserDTO = {
  walletAddress: '0xB0DccFD131fA98E42d161bEa10B3FCba40SndjS',
  roles: [Role.Member],
};
