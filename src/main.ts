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

  const provider = new ethers.providers.JsonRpcProvider(
    'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/mumbai',
  );

  const contract = new ethers.Contract(
    '0xD68603215c4646386d2e0bE68a38027CE4a7652d',
    SalesAbi.abi as any,
    provider,
  );

  // contract.on('Listed', (args) => console.log('contract: ', args));
  // contract.on('Delisted', (args) => console.log('contract: ', args));

  const service = app.get<EventsService>(EventsService);
  await service.attachAllEventListeners(contract);
}
bootstrap();
