import { ApiProperty } from '@nestjs/swagger';

export class AddEventDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  topic: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  chain_id: number;

  @ApiProperty()
  contract_address: string;

  @ApiProperty()
  webhook_url: string;

  @ApiProperty()
  fromBlock: number;

  @ApiProperty()
  blockRange: number;

  @ApiProperty()
  abi: object;

  @ApiProperty()
  sync_historical_data = false;
}
