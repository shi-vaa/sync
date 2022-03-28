import { Schema } from 'mongoose';

export class ExistingProjectDTO {
  name: string;
  description?: string;
  members: Schema.Types.ObjectId[];
  admins: Schema.Types.ObjectId[];
}
