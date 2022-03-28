import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as schema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
class Project {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  members: schema.Types.ObjectId[];

  @Prop({ required: true })
  admins: schema.Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
