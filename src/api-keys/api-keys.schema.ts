import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApiKeysDocument = ApiKeys & Document;

@Schema()
class ApiKeys {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  userId: Types.ObjectId;
}

export const ApiKeysSchema = SchemaFactory.createForClass(ApiKeys);
