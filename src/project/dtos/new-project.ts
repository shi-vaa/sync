import { Schema } from 'mongoose';

export class NewProjectDTO {
  name: string;
  description?: string;
  members: Schema.Types.ObjectId[];
  admins: Schema.Types.ObjectId[];
}
