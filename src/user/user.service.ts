import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

import { UserDocument } from './user.schema';
import { UserDetails } from './user-details.interface';
import { Role } from 'auth/decorators/roles.enum';
import { ProjectService } from 'project/project.service';

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
      walletAddress: user.walletAddress,
      roles: user.roles,
    };
  }

  async findByWalletAddress(walletAddress: string): Promise<UserDocument> {
    return this.userModel.findOne({ walletAddress }).exec();
  }

  async findByUserId(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async create(
    walletAddress: string,
    roles: string[],
    name?: string,
  ): Promise<UserDocument> {
    const newUser = new this.userModel({ walletAddress, roles, name });
    return newUser.save();
  }

  async makeAdmin(userId: string) {
    const user = await this.findByUserId(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    if (!user.roles.includes(Role.Admin)) {
      await this.userModel.updateOne(
        { _id: userId },
        { $push: { roles: Role.Admin } },
      );
    }
  }

  async addToProject(userId: string, projectId: string) {
    const project = await this.projectService.findByProjectId(projectId);
    const member = await this.findByUserId(userId);

    if (!member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { projects: projectId } },
    );
  }

  async removeFromProject(userId: string, projectId: string) {
    const project = await this.projectService.findByProjectId(projectId);
    const member = await this.findByUserId(userId);

    if (!member) {
      throw new Error('User does not exist');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    if (member?.projects) {
      if (!member.projects.includes(new Schema.Types.ObjectId(projectId))) {
        this.userModel.updateOne(
          { _id: userId },
          { $pull: { projects: projectId } },
        );
      }
    }
  }

  async deleteUserByWalletAddress(walletAddress: string) {
    await this.userModel.findOneAndDelete({ walletAddress }).exec();
  }

  async deleteUserById(userId: string) {
    await this.userModel.findOneAndDelete({ _id: userId });
  }
}
