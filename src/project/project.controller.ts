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
  ApiOkResponse,
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
import { AddEventDTO } from './dtos/add-project-event';
import { EventsService } from 'events/events.service';
import { removeEventDTO } from './dtos/remove-project-event';

@Controller('projects')
@ApiTags('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

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
    const { name, env, rpcs, description } = createProjectDto;

    try {
      return this.projectService.create(name, env, rpcs, description);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

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
  ) {
    const { projectName } = projectDetails;

    try {
      return this.projectService.removeProject(projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('info/:projectName')
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
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async removeEventFromProject(@Body() removeEventDetails: removeEventDTO) {
    try {
      const { topic, projectId } = removeEventDetails;
      await this.projectService.removeEvent(topic, projectId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
