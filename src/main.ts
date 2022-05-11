import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EventsService } from 'events/events.service';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { ContractService } from 'contract/contract.service';
import { ApiKeysService } from 'api-keys/api-keys.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Syncbox Backend')
    .setDescription('Syncbox APIs')
    .setVersion('1.0')
    .addTag('syncbox')
    .addBearerAuth(undefined, 'defaultBearerAuth')
    .build();

  const options = {
    swaggerOptions: {
      authAction: {
        defaultBearerAuth: {
          name: 'defaultBearerAuth',
          schema: {
            description: 'Default',
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: process.env.DEFAULT_BEARER_TOKEN,
        },
      },
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);

  await app.listen(process.env.PORT);
  const logger = app.get<PinoLoggerService>(PinoLoggerService);

  logger.logService(process.env.MONGO_URI).info('Server started');

  const service = app.get<EventsService>(EventsService);

  await service.attachAllEventListeners();

  await service.syncEvents();
}
bootstrap();
