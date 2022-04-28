import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import constants from 'docs/constants';
import { CreateProjectDTO } from './dtos/create-project';
import { BadRequestDTO } from './dtos/error';
import { ExistingProjectDTO } from './dtos/existing-project';
import { ProjectDetailsDTO } from './dtos/project-details';
import { ProjectService } from './project.service';
import { AddEventDTO } from './dtos/add-project-event';
import { removeEventDTO } from './dtos/remove-project-event';
import { AuthGuard } from 'auth/auth.guard';
import { JwtGuard } from 'auth/guards/jwt.guard';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import { GetProjectsDTO } from './dtos/get-projects';

@Controller('projects')
@ApiTags('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @ApiOkResponse({
    description: constants.OK.description,
    type: GetProjectsDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getAllProjects() {
    try {
      return { projects: await this.projectService.getAllProjects() };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('create')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
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
  ): Promise<ExistingProjectDTO> {
    const { name, env, rpcs, description } = createProjectDto;

    try {
      return this.projectService.create(name, env, rpcs, description);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('remove')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
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
  ) {
    const { projectName } = projectDetails;

    try {
      return this.projectService.removeProject(projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('info/:projectName')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: constants.OK.description,
    type: ExistingProjectDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getProjectDetails(
    @Param() projectDetails: ProjectDetailsDTO,
  ): Promise<ExistingProjectDTO> {
    const { projectName } = projectDetails;

    try {
      return this.projectService.getProjectDetails(projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/events/add')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async addEventToProject(@Body() addEventDetails: AddEventDTO) {
    try {
      const {
        name,
        topic,
        projectId,
        chain_id,
        contract_address,
        abi,
        webhook_url,
        sync_historical_data = false,
      } = addEventDetails;
      await this.projectService.addEvent(
        name,
        topic,
        projectId,
        chain_id,
        contract_address,
        webhook_url,
        abi,
        sync_historical_data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/events/remove')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async removeEventFromProject(@Body() removeEventDetails: removeEventDTO) {
    try {
      const { name, projectId } = removeEventDetails;
      await this.projectService.removeEvent(name, projectId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
