import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true, type: Types.ObjectId })
  projectId;

  @Prop({ required: true })
  chain_id: number;

  @Prop({ required: true })
  contract_address: string;

  @Prop({ default: false })
  sync_historical_data: boolean;

  @Prop({ required: true })
  webhook_url: string;

  @Prop({ required: true, type: String })
  abi;
}

export const EventSchema = SchemaFactory.createForClass(Event);
