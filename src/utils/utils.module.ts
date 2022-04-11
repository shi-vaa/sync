import { Module } from '@nestjs/common';
import {} from 'utils/web3';

@Module({
  exports: [UtilsModule],
})
export class UtilsModule {}
