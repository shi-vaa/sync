import { Module } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';

@Module({
  providers: [PinoLoggerService],
  exports: [LoggerModule, PinoLoggerService],
})
export class LoggerModule {}
