import { Prop } from '@nestjs/mongoose';
import { IAbi } from 'utils/interfaces/abi';

export class AddContractDTO {
  @Prop()
  abi: IAbi[];

  @Prop()
  projectId: string;

  @Prop()
  webhook_url: string;

  @Prop()
  contract_address: string;

  @Prop()
  chain_id: number;

  @Prop()
  fromBlock?: number;

  @Prop()
  blockRange?: number;
}
