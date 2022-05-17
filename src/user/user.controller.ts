import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'auth/auth.guard';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import { JwtGuard } from 'auth/guards/jwt.guard';
import constants from 'docs/constants';
import { BadRequestDTO } from 'project/dtos/error';
import { MakeAdminDTO } from './dtos/make-admin';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('projects')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @ApiOkResponse({
    description: constants.OK.description,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getAllUserProjects(@Query('email') email: string) {
    try {
      return await this.userService.getAllUserProjects(email);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('make-admin')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin)
  @ApiOkResponse({
    description: constants.OK.description,
    type: MakeAdminDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async makeAdmin(@Body() makeAdminDto: MakeAdminDTO, @Req() req) {
    try {
      const { userId } = makeAdminDto;
      this.userService.makeAdmin(req?.user.id, userId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
