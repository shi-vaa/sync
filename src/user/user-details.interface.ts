import { Schema } from 'mongoose';

export interface UserDetails {
  id: string;
  name?: string;
  email: string;
  roles: string[];
  projects?: Schema.Types.ObjectId[];
}
