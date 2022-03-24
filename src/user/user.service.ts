import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.schema';
import {Model} from "mongoose"
import { UserDetails } from './user-details.interface';

@Injectable()
export class UserService {
    constructor(@InjectModel("User") private readonly userModel: Model<UserDocument>) {}

    getUserDetails(user: UserDocument): UserDetails {
        return {
            id: user._id,
            name: user?.name,
            walletAddress: user.walletAddress,
            roles: user.roles,
        }
    }

    async findByWalletAddress(walletAddress : string) : Promise<UserDocument | null> {
        return this.userModel.findOne({ walletAddress }).exec();
    }

    async create(walletAddress: string, roles: string[], name?: string) : Promise<UserDocument> {
        const newUser = !name ? new this.userModel({walletAddress, roles, name}) : new this.userModel({walletAddress, roles});
        return newUser.save()
    }
}
