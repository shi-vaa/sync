import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import constants from 'docs/constants';
import { ExistingUserDTO } from 'user/dtos/existing-user.dto';
import { NewUserDTO } from 'user/dtos/new-user.dto';
import { AuthService } from './auth.service';
import { Role } from './decorators/roles.enum';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: constants.CREATED.description })
  register(
    @Body() user: NewUserDTO,
  ): Promise<{ _id: string; email: string; roles: Role[]; name?: string }> {
    try {
      return this.authService.register(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: constants.OK.description })
  login(@Body() user: ExistingUserDTO): Promise<{ token: string }> {
    try {
      return this.authService.login(user);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
