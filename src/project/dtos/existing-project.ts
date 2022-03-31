import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export class ExistingProjectDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  members: Schema.Types.ObjectId[];

  @ApiProperty()
  admins: Schema.Types.ObjectId[];
}
