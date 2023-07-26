import * as pino from 'pino';
import * as pinoPretty from 'pino-pretty';
import { config } from '../config.ts';

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
  },
  prettyPrint,
);
