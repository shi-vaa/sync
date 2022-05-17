import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

import { UserDocument } from './user.schema';
import { UserDetails } from './user-details.interface';
import { Role } from 'auth/decorators/roles.enum';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  getUserDetails(user: UserDocument): UserDetails {
    return {
      id: user._id,
      name: user?.name,
      email: user.email,
      roles: user.roles,
    };
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUserId(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async create(
    email: string,
    password: string,
    roles: string[],
    name?: string,
  ): Promise<UserDocument> {
    const newUser = new this.userModel({ email, password, roles, name });
    return newUser.save();
  }

  async makeAdmin(superAdminId: string, userId: string) {
    const user = await this.findByUserId(userId);
    const superAdmin = await this.findByUserId(superAdminId);

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!superAdmin) {
      throw new Error(Messages.UserNotFound);
    }

    if (!this.isSuperAdmin(superAdmin)) {
      throw new Error(Messages.NotASuperAdmin);
    }

    if (!user.roles.includes(Role.Admin)) {
      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { roles: Role.Admin } },
      );
    }
  }

  async removeFromProject(userId: string, projectId: string) {
    const project = await this.projectService.findByProjectId(projectId);
    const member = await this.findByUserId(userId);

    if (!member) {
      throw new Error(Messages.UserNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    if (member?.projects) {
      if (!member.projects.includes(new Schema.Types.ObjectId(projectId))) {
        this.userModel.updateOne(
          { _id: userId },
          { $pull: { projects: project['_id'] } },
        );
      }
    }
  }

  async deleteUserByEmail(email: string) {
    await this.userModel.findOneAndDelete({ email }).exec();
  }

  async deleteUserById(userId: string) {
    await this.userModel.findOneAndDelete({ _id: userId });
  }

  async addProject(userId: string, projectId: string) {
    const user = await this.findByUserId(userId);
    const project = await this.projectService.findByProjectId(projectId);

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    if (!project) {
      throw new Error(Messages.ProjectNotFound);
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { projects: project['_id'] } },
    );
  }

  async getAllUserProjects(email: string) {
    const projects = [];
    const user = await this.findByEmail(email);

    if (!user) {
      throw new Error(Messages.UserNotFound);
    }

    for (const projectId of user.projects) {
      projects.push(
        await this.projectService.findByProjectId(projectId.toString()),
      );
    }

    return projects;
  }

  isSuperAdmin(superAdmin: UserDocument) {
    return superAdmin.roles.includes(Role.SuperAdmin);
  }

  isAdmin(user: UserDocument) {
    return user.roles.includes(Role.Admin);
  }
}
