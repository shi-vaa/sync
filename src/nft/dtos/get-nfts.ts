import { ApiProperty } from '@nestjs/swagger';

export class GetNFTsDTO {
  @ApiProperty()
  rpc: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  fromBlock: number;

  @ApiProperty()
  toBlock: number;
}
