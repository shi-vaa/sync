import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.enum';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Get(':walletAddress')
  async getUser(@Param('walletAddress') walletAddress: string) {
    const user = await this.userService.findByWalletAddress(walletAddress);

    if (!user) {
      throw new Error('User does not exist');
    }

    return user;
  }
}
