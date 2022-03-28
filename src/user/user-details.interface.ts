import { Schema } from 'mongoose';

export interface UserDetails {
  id: string;
  name?: string;
  walletAddress: string;
  roles: string[];
  projects?: Schema.Types.ObjectId[];
}
