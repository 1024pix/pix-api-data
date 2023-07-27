import * as pino from 'pino';
import * as pinoPretty from 'pino-pretty';
import { config } from '../config.js';
import { stdSerializers } from 'pino';

const { logging } = config;

let prettyPrint;
if (logging.logForHumans) {
  const omitDay = 'HH:MM:ss';
  prettyPrint = pinoPretty.default({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
  });
}

export const logger = pino.default(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
    serializers: Object.assign(Object.create(null), stdSerializers),
  },
  prettyPrint,
);
