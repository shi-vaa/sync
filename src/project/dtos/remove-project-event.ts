import { ApiProperty } from '@nestjs/swagger';

export class removeEventDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  projectId: string;
}
