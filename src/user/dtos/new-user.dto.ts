import { ApiProperty } from '@nestjs/swagger';

export class NewUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  roles: string[];
}
