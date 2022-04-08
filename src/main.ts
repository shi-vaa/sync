import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ethers } from 'ethers';
import { UserService } from 'user/user.service';
import { AppModule } from './app.module';
import SalesAbi from 'abis/sale.json';
import { EventsService } from 'events/events.service';

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

  const service = app.get<EventsService>(EventsService);

  await service.syncEvents();
  await service.attachAllEventListeners();
}
bootstrap();
