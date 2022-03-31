import { ApiProperty } from '@nestjs/swagger';

export class ExistingUserDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  roles: string[];
}
