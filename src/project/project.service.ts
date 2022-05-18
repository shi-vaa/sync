import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { validate as uuidValidate } from 'uuid';

import { ProjectDocument } from './project.schema';
import { UserService } from 'user/user.service';
import { Messages } from 'utils/constants';
import { env } from 'types/env';
import { EventsService } from 'events/events.service';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ContractService } from 'contract/contract.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project')
    private readonly projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
    @Inject(forwardRef(() => ContractService))
    private readonly contractService: ContractService,
    private logger: PinoLoggerService,
  ) {}

  async create(
    userId: string,
    name: string,
    env: env,
    rpcs: string[],
    description?: string,
  ): Promise<ProjectDocument> {
    let existingProject = await this.projectModel.findOne({ name }).exec();
    const user = await this.userService.findByUserId(userId);

    if (existingProject) {
      throw new Error(Messages.ProjectExists);
    }

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!this.userService.isAdmin(user)) {
      throw new Error(Messages.NotAnAdmin);
    }

    const newProject = await new this.projectModel({
      name,
      description,
      env,
      rpcs,
      admins: [user._id],
      members: [user._id],
    });

    existingProject = await newProject.save();

    await this.userService.addProject(
      user._id.toString(),
      newProject._id.toString(),
    );

    return existingProject;
  }

  async findByProjectId(projectId: string): Promise<ProjectDocument> {
    return this.projectModel.findById(projectId).exec();
  }

  async findByProjectName(projectName: string): Promise<ProjectDocument> {
    return this.projectModel.findOne({ name: projectName }).exec();
  }

  async addMember(projectId: string, adminId: string, memberId: string) {
    const project = await this.projectModel.findById(projectId);
    const member = await this.userService.findByUserId(memberId);
    const admin = await this.userService.findByUserId(adminId);

    if (!admin) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isAdminOfProject(adminId, projectId))) {
      throw new Error(Messages.NotAnAdmin);
    }

    if (!member) {
      throw new Error(Messages.UserNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    await this.projectModel.updateOne(
      { _id: projectId },
      { $addToSet: { members: member._id } },
    );

    await this.userService.addProject(memberId, projectId);
  }

  async removeMember(projectId: string, adminId: string, memberId: string) {
    const project = await this.projectModel.findById(projectId);
    const member = await this.userService.findByUserId(memberId);
    const admin = await this.userService.findByUserId(adminId);

    if (!admin) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isAdminOfProject(adminId, projectId))) {
      throw new Error(Messages.NotAnAdmin);
    }

    if (!member) {
      throw new Error(Messages.UserNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    await this.userService.removeFromProject(memberId, projectId);

    if (!project.members.includes(new Schema.Types.ObjectId(memberId))) {
      this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { members: member._id } },
      );
    }
  }

  async removeProject(adminId: string, projectName: string) {
    const project = await this.findByProjectName(projectName);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    const admin = await this.userService.findByUserId(adminId);

    if (!admin) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isAdminOfProject(adminId, project['_id']))) {
      throw new Error(Messages.NotAnAdmin);
    }

    project.event_ids.forEach(
      async (id) => await this.eventService.removeEvent(id.toString()),
    );
    await this.deleteProjectByName(projectName);
  }

  async getProjectDetails(
    userId: string,
    projectName: string,
  ): Promise<ProjectDocument> {
    const project = await this.findByProjectName(projectName);
    const user = await this.userService.findByUserId(userId);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isUserPartOfProject(userId, project['_id']))) {
      throw new Error(Messages.NotAMember);
    }

    return project;
  }

  async isAdminOfProject(adminId: string, projectId: string): Promise<boolean> {
    const existingProject = await this.findByProjectId(projectId);
    return existingProject.admins.toString().includes(adminId);
  }

  async isUserPartOfProject(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const existingProject = await this.findByProjectId(projectId);
    return existingProject.members.toString().includes(userId);
  }

  async deleteProjectById(projectId: string) {
    await this.projectModel.findOneAndDelete({ _id: projectId });
  }

  async deleteProjectByName(projectName: string) {
    await this.projectModel.findOneAndDelete({ name: projectName });
  }

  async getAllProjectEventIds(projectId: string) {
    const project = await this.findByProjectId(projectId);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }
  }

  async addEvent(
    projectId: string,
    name: string,
    topic: string,
    chain_id: number,
    contract_address: string,
    webhook_url: string,
    abi: object,
    fromBlock = 0,
    blockRange = 1000,
    sync_historical_data = false,
    userId?: string,
  ) {
    const project = await this.findByProjectId(projectId);
    const existingEvent = await this.eventService.getEvent(name, projectId);
    if (userId) {
      const user = this.userService.findByUserId(userId);
      if (!user) {
        throw new Error(Messages.UserNotFound);
      }
    }

    if (existingEvent) {
      throw new Error(Messages.EventExists);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (!(await this.isUserPartOfProject(userId, projectId))) {
      throw new Error(Messages.NotAMember);
    }

    const event = await this.eventService.createEvent(
      name,
      topic,
      projectId,
      chain_id,
      contract_address,
      webhook_url,
      fromBlock,
      blockRange,
      JSON.stringify(abi),
      sync_historical_data,
    );

    await this.projectModel.updateOne(
      { _id: projectId },
      { $addToSet: { event_ids: event._id } },
    );
  }

  async removeEvent(userId: string, projectId: string, name: string) {
    const project = await this.findByProjectId(projectId);
    const event = await this.eventService.getEvent(name, projectId);
    const user = await this.userService.findByUserId(userId);

    if (!event) {
      throw new Error(Messages.EventNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isUserPartOfProject(userId, projectId))) {
      throw new Error(Messages.NotAMember);
    }

    await this.eventService.removeEvent(event._id);

    await this.projectModel.updateOne(
      { _id: projectId },
      { $pull: { event_ids: event._id } },
    );
  }

  async updateEvent(
    userId: string,
    projectId: string,
    eventId: string,
    event: {
      topic?: string;
      webhook_url?: string;
      fromBlock?: number;
      blockRange?: number;
      abi?: any;
    },
  ) {
    const project = await this.findByProjectId(projectId);
    const existingEvent = await this.eventService.findByEventId(eventId);
    const user = await this.userService.findByUserId(userId);

    if (!existingEvent) {
      throw new Error(Messages.EventNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!(await this.isUserPartOfProject(userId, projectId))) {
      throw new Error(Messages.NotAMember);
    }

    await this.eventService.updateEvent(eventId, event);
  }

  async validateAppId(appId: string, projectName?: string, projectId?: string) {
    if (!uuidValidate(appId)) {
      throw new Error(Messages.InvalidAppId);
    }

    const project = projectName
      ? await this.findByProjectName(projectName)
      : await this.findByProjectId(projectId);

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    return true;
  }

  async getAllProjects(): Promise<ProjectDocument[]> {
    return this.projectModel.find();
  }

  async getAppId(projectId: string) {
    return (await this.projectModel.findById(projectId)).APP_ID;
  }

  async getContracts(projectId: string) {
    return this.contractService.getContractsForProject(projectId);
  }

  async pushEventId(projectId: string, eventId: string) {
    await this.projectModel.updateOne(
      { _id: projectId },
      { $push: { event_ids: eventId } },
    );
  }
}
