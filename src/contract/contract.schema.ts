import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IAbi } from 'utils/interfaces/abi';

export type ContractDocument = Contract & Document;

@Schema()
class Contract {
  @Prop({ required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  contract_address: string;

  @Prop({ required: true })
  abi: IAbi[];

  @Prop()
  _constructor: string;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
