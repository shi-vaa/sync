import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ExistingUserDTO } from 'user/dtos/existing-user.dto';
import { UserDetails } from 'user/user-details.interface';
import { NewUserDTO } from 'user/dtos/new-user.dto';
import { UserService } from 'user/user.service';
import { Messages } from 'utils/constants';
import { Role } from './decorators/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    user: Readonly<NewUserDTO>,
  ): Promise<{ _id: string; email: string; roles: Role[]; name?: string }> {
    let name;
    const { email, password } = user;

    if (user?.name) {
      name = user.name;
    }

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new Error(Messages.UserExists);
    }

    const newUser = await this.userService.create(email, password, name);

    return {
      _id: newUser._id,
      email: newUser.email,
      roles: newUser.roles,
      name: newUser.name,
    };
  }

  async validateUser(email: string, password: string): Promise<UserDetails> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    const doPasswordsMatch = await user.comparePasswords(password);
    if (!doPasswordsMatch) {
      throw new Error(Messages.IncorrectPassword);
    }

    return this.userService.getUserDetails(user);
  }

  async login(existingUser: ExistingUserDTO): Promise<{ token: string }> {
    const { email, password } = existingUser;

    try {
      const user = await this.validateUser(email, password);

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
