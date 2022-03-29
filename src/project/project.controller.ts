import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import constants from 'docs/constants';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import { RolesGuard } from 'auth/decorators/roles.guard';
import { AddProjectMemberDTO } from './dtos/add-project-member';
import { CreateProjectDTO } from './dtos/create-project';
import { BadRequestDTO } from './dtos/error';
import { ExistingProjectDTO } from './dtos/existing-project';
import { ProjectDetailsDTO } from './dtos/project-details';
import { RemoveProjectMemberDTO } from './dtos/remove-project-member';
import { ProjectService } from './project.service';

@Controller('project')
@ApiTags('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Roles(Role.Member, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create')
  @ApiCreatedResponse({
    description: constants.CREATED.description,
    type: ExistingProjectDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async create(
    @Body() createProjectDto: CreateProjectDTO,
    @Req() req,
  ): Promise<ExistingProjectDTO> {
    const { name, description } = createProjectDto;
    const { user } = req;

    try {
      return this.projectService.create(user.id, name, description);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Post('members/add')
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async addMember(
    @Body()
    addProjectMemberDto: AddProjectMemberDTO,
    @Req() req,
  ) {
    const { projectId, memberId } = addProjectMemberDto;
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
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async removeMember(
    @Body()
    removeProjectMemberDto: RemoveProjectMemberDTO,
    @Req() req,
  ) {
    const { projectId, memberId } = removeProjectMemberDto;
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
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async removeProject(
    @Body()
    projectDetails: ProjectDetailsDTO,
    @Req() req,
  ) {
    const { projectId } = projectDetails;
    const { user } = req;

    try {
      return this.projectService.removeProject(projectId, user.id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Roles(Role.Member, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('info/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
    type: ExistingProjectDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getProjectDetails(
    @Param() projectDetails: ProjectDetailsDTO,
    @Req() req,
  ): Promise<ExistingProjectDTO> {
    const { projectId } = projectDetails;
    const { user } = req;

    try {
      return this.projectService.getProjectDetails(projectId, user.id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
