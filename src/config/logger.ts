import { pino } from 'pino';
import pretty from 'pino-pretty';

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
