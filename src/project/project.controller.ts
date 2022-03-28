import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.enum';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Roles(Role.Member, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create')
  async create(
    @Body() project: { name: string; description?: string },
    @Req() req,
  ) {
    const { name, description } = project;
    const { user } = req;

    try {
      return this.projectService.create(user.id, name, description);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('members/add')
  async addMember(
    @Body()
    requestBody: { projectId: string; memberId: string },
    @Req() req,
  ) {
    const { projectId, memberId } = requestBody;
    const { user } = req;

    try {
      return this.projectService.addMember(projectId, user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('members/remove')
  async removeMember(
    @Body()
    requestBody: { projectId: string; memberId: string },
    @Req() req,
  ) {
    const { projectId, memberId } = requestBody;
    const { user } = req;

    try {
      return this.projectService.removeMember(projectId, user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('remove')
  async removeProject(
    @Body()
    requestBody: { projectId: string },
    @Req() req,
  ) {
    const { projectId } = requestBody;
    const { user } = req;

    try {
      return this.projectService.removeProject(projectId, user.id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Member, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('info')
  async getProjectDetails(
    @Body()
    requestBody: { projectId: string },
    @Req() req,
  ) {
    const { projectId } = requestBody;
    const { user } = req;

    try {
      return this.projectService.getProjectDetails(projectId, user.id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
