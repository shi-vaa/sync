import { ApiProperty } from '@nestjs/swagger';

export class MakeAdminDTO {
  @ApiProperty()
  userId: string;
}
