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

@Controller('project')
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
    const { name, description } = createProjectDto;
    const { user } = req;

    try {
      return this.projectService.create(user.id, name, description);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

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

  @Get('info/:projectId')
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

  @Post('/events/add')
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async addEventToProject(@Body() addEventDetails: AddEventDTO) {
    try {
      const {
        topic,
        projectName,
        chain_id,
        contract_address,
        abi,
        webhook_url,
        sync_historical_data = false,
      } = addEventDetails;
      await this.projectService.addEvent(
        topic,
        projectName,
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
      const { topic, projectName } = removeEventDetails;
      await this.projectService.removeEvent(topic, projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
