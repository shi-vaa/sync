import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EventsService } from 'events/events.service';
import { pino } from 'pino';
import pretty from 'pino-pretty';

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

  const service = app.get<EventsService>(EventsService);

  logger.info('Attaching event listeners');
  await service.attachAllEventListeners();

  logger.info('Syncing events');
  await service.syncEvents();
  logger.info('Synced all events');
}
bootstrap();

const stream = pretty({ colorize: true });

let logger = pino(
  {
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: {
            translateTime: 'SYS:dd:mm:yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
        {
          target: 'pino-mongodb',
          level: 'info',
          options: {
            uri: process.env.MONGO_URI,
            collection: 'logs',
          },
        },
      ],
    },
  },
  stream,
);
logger = logger.child({
  endpoint: null,
  createdBy: null,
  category: null,
  stack: null,
});
const info = (message, endpoint = null, createdBy = null, category = null) => {
  logger = logger.child({ endpoint, createdBy, category });

  logger.info(message, endpoint, createdBy, category);
};

const warn = (message, endpoint = null, createdBy = null, category = null) => {
  logger = logger.child({ endpoint, createdBy, category });

  logger.warn(message, endpoint, createdBy, category);
};

const error = (
  message,
  endpoint = null,
  createdBy = null,
  category = null,
  stack = null,
) => {
  logger = logger.child({ endpoint, createdBy, category, stack });

  logger.error(message, endpoint, createdBy, category, stack);
};

const debug = (
  message,
  endpoint = null,
  createdBy = null,
  category = null,
  stack = null,
) => {
  logger = logger.child({ endpoint, createdBy, category, stack });

  logger.debug(message, endpoint, createdBy, category, stack);
};

const fatal = (
  message,
  endpoint = null,
  createdBy = null,
  category = null,
  stack = null,
) => {
  logger = logger.child({ endpoint, createdBy, category, stack });

  logger.fatal(message, endpoint, createdBy, category, stack);
};

export default {
  info,
  warn,
  error,
  debug,
  fatal,
};
