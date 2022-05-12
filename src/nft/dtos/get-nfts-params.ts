import { ApiProperty } from '@nestjs/swagger';

export class GetNftsParamsDTO {
  @ApiProperty()
  contract_address: string;
}
