import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Event & Document;

@Schema()
export class Event {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  chain_id: string;

  @Prop({ required: true })
  contract_address: string;

  @Prop({ default: false })
  sync_historical_data: boolean;

  @Prop({ required: true })
  webhook_url: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
