import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { generateApiKey } from 'utils/helper';
import { ApiKeysDocument } from './api-keys.schema';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectModel('ApiKeys')
    private readonly apiKeysModel: Model<ApiKeysDocument>,
  ) {}

  async createApiKey(userId: string): Promise<ApiKeysDocument> {
    const key = generateApiKey();
    const apiKey = new this.apiKeysModel({ key, userId });

    return apiKey.save();
  }

  async getApiKey(key: string): Promise<ApiKeysDocument> {
    return this.apiKeysModel.findOne({ key });
  }

  async findByUserId(userId: string): Promise<ApiKeysDocument> {
    return this.apiKeysModel.findOne({ userId });
  }
}
