import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EventsService } from 'events/events.service';
import { pino } from 'pino';
import pretty from 'pino-pretty';
// import logger from 'logger';
import { Logger } from '@nestjs/common';
import { PinoLoggerService } from 'logger/pino-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Syncbox Backend')
    .setDescription('Syncbox APIs')
    .setVersion('1.0')
    .addTag('syncbox')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  const logger = app.get<PinoLoggerService>(PinoLoggerService);

  logger.logService(process.env.MONGO_URI).info('Server started');

  const service = app.get<EventsService>(EventsService);

  logger.logService(process.env.MONGO_URI).info('Attaching event listeners');
  await service.attachAllEventListeners();

  logger.logService(process.env.MONGO_URI).info('Syncing events');
  await service.syncEvents();
  logger.logService(process.env.MONGO_URI).info('Synced all events');

  logger
    .logService(process.env.MONGO_URI)
    .info('Fetching NFTs for 0xB0DccFD131fA98E42d161bEa10B034FCba40aDae');
  await service.getNfts(
    '0xb0dccfd131fa98e42d161bea10b034fcba40adae',
    process.env.POLYGON_RPC,
    '625eadc30a8e0a0ec5464254',
    25846638,
  );
  logger.logService(process.env.MONGO_URI).info('Fetched NFTs');
}
bootstrap();
