import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { ProjectDocument } from './project.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project')
    private readonly projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(
    creatorId: string,
    name: string,
    description?: string,
  ): Promise<ProjectDocument> {
    const creator = await this.userService.findByUserId(creatorId);

    const existingProject = await this.projectModel.findOne({ name }).exec();

    if (!creator) {
      throw new Error('User does not exist');
    }

    if (existingProject) {
      throw new Error('Project already exisits');
    }

    await this.userService.makeAdmin(creatorId);
    const newProject = await new this.projectModel({
      name,
      description,
      members: [creatorId],
      admins: [creatorId],
    });

    const createdProject = await newProject.save();

    await this.userService.addToProject(
      creatorId,
      createdProject._id.toString(),
    );

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
    const admin = await this.userService.findByUserId(adminId);
    const member = await this.userService.findByUserId(memberId);

    if (!admin || !member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    if (await !this.isAdminOfProject(adminId, null, project)) {
      throw new Error('User is not an admin');
    }

    await this.userService.addToProject(memberId, projectId);

    if (!project.members.includes(new Schema.Types.ObjectId(memberId))) {
      this.projectModel.updateOne(
        { _id: projectId },
        { $push: { members: memberId } },
      );
    }
  }

  async removeMember(projectId: string, adminId: string, memberId: string) {
    const project = await this.projectModel.findById(projectId);
    const admin = await this.userService.findByUserId(adminId);
    const member = await this.userService.findByUserId(memberId);

    if (!admin || !member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    if (await !this.isAdminOfProject(adminId, null, project)) {
      throw new Error('User is not an admin');
    }

    await this.userService.removeFromProject(memberId, projectId);

    if (!project.members.includes(new Schema.Types.ObjectId(memberId))) {
      this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { members: memberId } },
      );
    }
  }

  async removeProject(projectId: string, adminId: string) {
    const project = await this.projectModel.findById(projectId);
    const admin = await this.userService.findByUserId(adminId);

    if (!admin) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    if (await !this.isAdminOfProject(adminId, null, project)) {
      throw new Error('User is not an admin');
    }

    project.members.forEach(
      async (memberId) =>
        await this.userService.removeFromProject(
          memberId.toString(),
          projectId,
        ),
    );

    project.admins.forEach(
      async (adminId) =>
        await this.userService.removeFromProject(adminId.toString(), projectId),
    );

    await this.deleteProjectById(projectId);
  }

  async getProjectDetails(
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument> {
    const project = await this.findByProjectId(projectId);
    const user = await this.userService.findByUserId(userId);

    if (!project) {
      throw new Error('Project does not exist');
    }

    if (!user) {
      throw new Error('User does not exist');
    }

    if (await !this.isUserPartOfProject(userId, null, project)) {
      throw new Error('User is not a project member');
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
}
