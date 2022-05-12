import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export class NewProjectDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  members: Schema.Types.ObjectId[];

  @ApiProperty()
  admins: Schema.Types.ObjectId[];
}
