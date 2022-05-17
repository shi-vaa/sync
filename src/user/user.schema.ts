import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'auth/decorators/roles.enum';
import { Document, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true, required: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: [Role.Member] })
  roles: Role[];

  @Prop({ default: [] })
  projects: ObjectId[];

  comparePasswords;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePasswords = async function (submittedPassword) {
  return bcrypt.compare(submittedPassword, this.password);
};
