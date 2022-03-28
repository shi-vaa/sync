import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExistingUserDTO } from '../user/dtos/existing-user.dto';
import { UserDetails } from '../user/user-details.interface';
import { NewUserDTO } from '../user/dtos/new-user.dto';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
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
      throw new Error('User already exists.');
    }

    return await this.userService.create(walletAddress, roles, name);
  }

  async validateUser(walletAddress: string): Promise<UserDetails> {
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (!user) {
      throw new Error('User does not exist');
    }

    return this.userService.getUserDetails(user);
  }

  async login(existingUser: ExistingUserDTO): Promise<{ token: string }> {
    const { walletAddress } = existingUser;

    try {
      const user = await this.validateUser(walletAddress);

      const jwt = await this.jwtService.signAsync(
        { user },
        { secret: process.env.TOKEN_SECRET },
      );

      return { token: jwt };
    } catch (err) {
      throw err;
    }
  }
}
