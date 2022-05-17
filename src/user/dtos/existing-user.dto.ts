import { ApiProperty } from '@nestjs/swagger';

export class ExistingUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  roles: string[];
}
