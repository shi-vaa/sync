import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExistingUserDTO } from 'user/dtos/existing-user.dto';
import { NewUserDTO } from 'user/dtos/new-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() user: NewUserDTO): Promise<NewUserDTO> {
    return this.authService.register(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() user: ExistingUserDTO): Promise<{ token: string }> {
    return this.authService.login(user);
  }
}
