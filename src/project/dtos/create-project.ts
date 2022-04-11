import { ApiProperty } from '@nestjs/swagger';
import { env } from 'types/env';

export class CreateProjectDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  env: env;

  @ApiProperty()
  rpcs: string[];
}
