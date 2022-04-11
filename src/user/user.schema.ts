import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'auth/decorators/roles.enum';
import { Document, ObjectId } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ required: true, default: [Role.Member] })
  roles: Role[];

  @Prop({ default: [] })
  projects: ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
