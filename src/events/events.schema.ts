import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IAbi } from 'utils/interfaces/abi';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop({ required: true })
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

  @Prop({ default: 0 })
  fromBlock: number;

  @Prop({ default: 1000 })
  blockRange: number;

  @Prop({ required: true, type: Object })
  abi: IAbi;
}

export const EventSchema = SchemaFactory.createForClass(Event);
