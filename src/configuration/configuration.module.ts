import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from 'app.module';

@Module({
  exports: [ConfigurationModule],
})
export class ConfigurationModule {}
