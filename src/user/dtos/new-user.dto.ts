import { ApiProperty } from '@nestjs/swagger';

export class NewUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
