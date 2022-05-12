import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
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
import { AddProjectMemberDTO } from './dtos/add-project-member';
import { RemoveProjectMemberDTO } from './dtos/remove-project-member';
import { UpdateEventDTO } from './dtos/update-project-event';
import { GetAppIdDTO } from './dtos/get-app-id';
import { GetContractsDTO } from './dtos/get-contracts';
import { Messages } from 'utils/constants';

@Controller('projects')
@ApiTags('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
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
      return this.projectService.create(
        req?.user.id,
        name,
        env,
        rpcs,
        description,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
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
    const { projectName } = projectDetails;

    try {
      return this.projectService.removeProject(req?.user?.id, projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':projectName')
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
    @Req() req,
  ): Promise<ExistingProjectDTO> {
    const { projectName } = projectDetails;

    try {
      return this.projectService.getProjectDetails(req?.user.id, projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('events')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async addEventToProject(@Body() addEventDetails: AddEventDTO, @Req() req) {
    try {
      const {
        name,
        topic,
        projectId,
        chain_id,
        contract_address,
        abi,
        webhook_url,
        fromBlock,
        blockRange,
        sync_historical_data = false,
      } = addEventDetails;

      await this.projectService.addEvent(
        req?.user.id,
        projectId,
        name,
        topic,
        chain_id,
        contract_address,
        webhook_url,
        abi,
        fromBlock,
        blockRange,
        sync_historical_data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('events')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async removeEventFromProject(
    @Body() removeEventDetails: removeEventDTO,
    @Req() req,
  ) {
    try {
      const { name, projectId } = removeEventDetails;

      await this.projectService.removeEvent(req?.user.id, projectId, name);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Patch('/events')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Member, Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async updateEvent(@Body() updateEventDto: UpdateEventDTO, @Req() req) {
    try {
      const { projectId, eventId, event } = updateEventDto;

      await this.projectService.updateEvent(
        req?.user.id,
        projectId,
        eventId,
        event,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/members')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async addMember(
    @Body() addProjectMemberDto: AddProjectMemberDTO,
    @Req() req,
  ) {
    try {
      const { projectId, memberId } = addProjectMemberDto;

      await this.projectService.addMember(projectId, req?.user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('/members')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiCreatedResponse({
    description: constants.OK.description,
  })
  async removeMember(
    @Body() removeMemberDto: RemoveProjectMemberDTO,
    @Req() req,
  ) {
    try {
      const { projectId, memberId } = removeMemberDto;

      await this.projectService.removeMember(projectId, req?.user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('contracts/:projectId')
  @ApiHeader({ name: 'app_id', example: '' })
  @ApiOkResponse({
    description: constants.OK.description,
    type: GetContractsDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getContractsForProject(
    @Param() getContractsDTO: GetContractsDTO,
    @Req() req,
  ) {
    try {
      const { projectId } = getContractsDTO;

      if (!req.headers?.app_id) {
        throw new BadRequestException(Messages.AppIdRequired);
      }

      if (
        !(await this.projectService.validateAppId(
          req.headers.app_id,
          null,
          projectId,
        ))
      ) {
        throw new Error(Messages.IncorrectAppId);
      }

      return await this.projectService.getContracts(projectId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
