import { ApiProperty } from '@nestjs/swagger';

import { IAbi } from 'utils/interfaces/abi';

export class AddContractDTO {
  @ApiProperty()
  abi: IAbi[];

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  webhook_url: string;

  @ApiProperty()
  contract_address: string;

  @ApiProperty()
  chain_id: number;

  @ApiProperty()
  fromBlock?: number;

  @ApiProperty()
  blockRange?: number;
}
