import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExistingUserDTO } from 'user/dtos/existing-user.dto';
import { UserDetails } from 'user/user-details.interface';
import { NewUserDTO } from 'user/dtos/new-user.dto';
import { UserDocument } from 'user/user.schema';
import { UserService } from 'user/user.service';
import { Messages } from 'utils/constants';
import { ApiKeysService } from 'api-keys/api-keys.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async register(user: Readonly<NewUserDTO>): Promise<UserDocument> {
    let name;
    const { walletAddress, roles } = user;

    if (user?.name) {
      name = user.name;
    }

    const existingUser = await this.userService.findByWalletAddress(
      walletAddress,
    );

    if (existingUser) {
      throw new Error(Messages.UserExists);
    }

    const newUser = await this.userService.create(walletAddress, roles, name);
    await this.apiKeysService.createApiKey(newUser._id);

    return newUser;
  }

  async validateUser(walletAddress: string): Promise<UserDetails> {
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    return this.userService.getUserDetails(user);
  }

  async login(
    existingUser: ExistingUserDTO,
  ): Promise<{ token: string; apiKey: string }> {
    const { walletAddress } = existingUser;

    try {
      const user = await this.validateUser(walletAddress);

      const jwt = await this.jwtService.signAsync(
        { user },
        { secret: process.env.TOKEN_SECRET },
      );

      const apiKey = await this.apiKeysService.findByUserId(user.id);

      return { token: jwt, apiKey: apiKey.key };
    } catch (err) {
      throw err;
    }
  }
}
