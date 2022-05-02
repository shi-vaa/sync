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
import { GetProjectsDTO } from './dtos/get-projects';
import { AddProjectMemberDTO } from './dtos/add-project-member';
import { RemoveProjectMemberDTO } from './dtos/remove-project-member';
import { Messages } from 'utils/constants';

@Controller('projects')
@ApiTags('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('create')
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

  @Post('remove')
  @ApiHeader({ name: 'app_id', example: '' })
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
    if (!req.headers?.app_id) {
      throw new BadRequestException(Messages.AppIdRequired);
    }

    if (
      !(await this.projectService.validateAppId(
        req.headers.app_id,
        projectName,
      ))
    ) {
      throw new Error(Messages.IncorrectAppId);
    }

    try {
      return this.projectService.removeProject(req?.user?.id, projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('info/:projectName')
  @ApiHeader({ name: 'app_id', example: '' })
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
      if (!req.headers?.app_id) {
        throw new BadRequestException(Messages.AppIdRequired);
      }

      if (
        !(await this.projectService.validateAppId(
          req.headers.app_id,
          projectName,
        ))
      ) {
        throw new Error(Messages.IncorrectAppId);
      }

      return this.projectService.getProjectDetails(req?.user.id, projectName);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/events/add')
  @ApiHeader({ name: 'app_id', example: '' })
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
        sync_historical_data = false,
      } = addEventDetails;

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

      await this.projectService.addEvent(
        req?.user.id,
        projectId,
        name,
        topic,
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
  @ApiHeader({ name: 'app_id', example: '' })
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

      await this.projectService.removeEvent(req?.user.id, projectId, name);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/members/add')
  @ApiHeader({ name: 'app_id', example: '' })
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

      await this.projectService.addMember(projectId, req?.user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('/members/remove')
  @ApiHeader({ name: 'app_id', example: '' })
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

      await this.projectService.removeMember(projectId, req?.user.id, memberId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
