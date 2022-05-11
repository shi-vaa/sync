import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { providers } from 'ethers';
import { ApiKeysSchema } from './api-keys.schema';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ApiKeys', schema: ApiKeysSchema }]),
  ],
  providers: [ApiKeysService],
  exports: [
    MongooseModule.forFeature([{ name: 'ApiKeys', schema: ApiKeysSchema }]),
  ],
})
export class ApiKeysModule {}
