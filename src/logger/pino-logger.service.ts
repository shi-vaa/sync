import { Injectable, Scope, LoggerService } from '@nestjs/common';
import pino from 'pino';
import pretty from 'pino-pretty';

let logger;

@Injectable({ scope: Scope.DEFAULT })
export class PinoLoggerService implements LoggerService {
  logService = (mongoUri): pino.Logger => {
    return pino(
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
                uri: mongoUri,
                collection: 'logs',
              },
            },
          ],
        },
      },
      pretty({ colorize: true }),
    );
  };

  debug(message: any, context?: string): any {
    logger = logger.child({ message });

    logger.debug(message);
  }

  error(message: any, trace?: string, context?: string): any {
    logger = logger.child({ message });

    logger.error(message);
  }

  log(message: any, context?: string): any {
    logger = logger.child({ message });

    logger.log(message);
  }

  warn(message: any, context?: string): any {
    logger = logger.child({ message });

    logger.warn(message);
  }
}
