import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as schema, ObjectId } from 'mongoose';
import { env } from 'types/env';

export type ProjectDocument = Project & Document;

@Schema()
class Project {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  members: schema.Types.ObjectId[];

  @Prop()
  admins: schema.Types.ObjectId[];

  @Prop({ required: true })
  env: env;

  @Prop()
  event_ids: ObjectId[];

  @Prop({ required: true })
  rpcs: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
