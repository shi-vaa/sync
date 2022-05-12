import { ApiProperty } from '@nestjs/swagger';

export class RemoveContractDTO {
  @ApiProperty()
  contract_address: string;

  @ApiProperty()
  projectId: string;
}
