import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { ProjectDocument } from './project.schema';
import { UserService } from 'user/user.service';
import { Messages } from 'utils/constants';
import { EventDocument } from 'events/events.schema';
import { env } from 'types/env';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project')
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel('Event')
    private readonly eventModel: Model<EventDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(
    name: string,
    env: env,
    rpcs: string[],
    description?: string,
  ): Promise<ProjectDocument> {
    const existingProject = await this.projectModel.findOne({ name }).exec();

    if (existingProject) {
      throw new Error('Project already exisits');
    }

    const newProject = await new this.projectModel({
      name,
      description,
      env,
      rpcs,
    });

    const createdProject = await newProject.save();

    return createdProject;
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

    if (!member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    await this.projectModel.updateOne(
      { _id: projectId },
      { $addToSet: { members: memberId } },
    );
  }

  async removeMember(projectId: string, adminId: string, memberId: string) {
    const project = await this.projectModel.findById(projectId);
    // const admin = await this.userService.findByUserId(adminId);
    const member = await this.userService.findByUserId(memberId);

    if (!member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    // if (await !this.isAdminOfProject(adminId, null, project)) {
    //   throw new Error('User is not an admin');
    // }

    await this.userService.removeFromProject(memberId, projectId);

    if (!project.members.includes(new Schema.Types.ObjectId(memberId))) {
      this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { members: memberId } },
      );
    }
  }

  async removeProject(projectName: string) {
    const project = await this.findByProjectName(projectName);

    if (!project) {
      throw new Error('Project does not exist');
    }

    project.event_ids.forEach(
      async (id) => await this.eventModel.findOneAndDelete({ _id: id }),
    );
    await this.deleteProjectByName(projectName);
  }

  async getProjectDetails(projectName: string): Promise<ProjectDocument> {
    const project = await this.findByProjectName(projectName);

    if (!project) {
      throw new Error('Project does not exist');
    }

    return project;
  }

  async isAdminOfProject(
    adminId: string,
    projectId?: string,
    project?: ProjectDocument,
  ): Promise<boolean> {
    if (projectId) {
      const existingProject = await this.findByProjectId(projectId);
      return existingProject.admins.includes(
        new Schema.Types.ObjectId(adminId),
      );
    }

    return project.admins.includes(new Schema.Types.ObjectId(adminId));
  }

  async isUserPartOfProject(
    userId: string,
    projectId?: string,
    project?: ProjectDocument,
  ): Promise<boolean> {
    if (projectId) {
      const existingProject = await this.findByProjectId(projectId);
      return existingProject.members.includes(
        new Schema.Types.ObjectId(userId),
      );
    }

    return project.members.includes(new Schema.Types.ObjectId(userId));
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
    name: string,
    topic: string,
    projectId: string,
    chain_id: number,
    contract_address: string,
    webhook_url: string,
    abi: object,
    sync_historical_data = false,
  ) {
    const project = await this.findByProjectId(projectId);
    const existingEvent = await this.eventModel.findOne({ topic });

    if (existingEvent) {
      throw new Error(Messages.EventExists);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    const newEvent = new this.eventModel({
      name,
      topic,
      projectId,
      chain_id,
      contract_address,
      webhook_url,
      abi: JSON.stringify(abi),
      sync_historical_data,
    });

    const event = await newEvent.save();

    await this.projectModel.updateOne(
      { _id: projectId },
      { $push: { event_ids: event._id } },
    );
  }

  async removeEvent(topic: string, projectId: string) {
    const project = await this.findByProjectId(projectId);
    const event = await this.eventModel.findOne({ topic });

    if (!event) {
      throw new Error(Messages.EventNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    await this.eventModel.findOneAndDelete({ topic });

    this.projectModel.updateOne(
      { _id: projectId },
      { $pull: { event_ids: event._id } },
    );
  }

  async getAllProjects(): Promise<ProjectDocument[]> {
    return this.projectModel.find();
  }
}
