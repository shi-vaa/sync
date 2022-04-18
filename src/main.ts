import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EventsService } from 'events/events.service';
import logger from 'configuration/logger';
import { ConfigurationModule } from 'configuration/configuration.module';

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
  logger.info('Server started');

  app.useLogger(app.get(ConfigurationModule));
  const service = app.get<EventsService>(EventsService);

  logger.info('Syncing events');
  await service.syncEvents();

  logger.info('Attaching event listeners');
  await service.attachAllEventListeners();

  // logger.info('Fetching NFTs for 0xB0DccFD131fA98E42d161bEa10B034FCba40aDae');
  // await service.getNfts(
  //   '0xb0dccfd131fa98e42d161bea10b034fcba40adae',
  //   process.env.POLYGON_RPC,
  //   '6250299c535023d279b8fa4c',
  //   25900654
  // );
}
bootstrap();
