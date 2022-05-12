import { ApiProperty } from '@nestjs/swagger';

export class GetContractsDTO {
  @ApiProperty()
  projectId: string;
}
