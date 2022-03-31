import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "../auth/decorators/roles.enum";
import {Document} from "mongoose";

export type UserDocument = User & Document;

@Schema()
 class User {
    @Prop()
    name: string;

    @Prop({required: true, unique: true})
    walletAddress: string;

    @Prop({required: true, default: [Role.Member]})
    roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);