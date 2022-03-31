import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as schema, ObjectId } from 'mongoose';
import { env } from 'types/env';
import { RPC } from 'types/rpc';

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

  @Prop({ required: true })
  env: env;

  @Prop({ required: true })
  event_ids: ObjectId[];

  @Prop({ required: true })
  rpcs: RPC[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
