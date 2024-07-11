import * as pino from 'pino';
import { stdSerializers } from 'pino';
import * as pinoPretty from 'pino-pretty';

import { config } from '../config.js';

const { logging } = config;

let prettyPrint;
if (logging.logForHumans) {
  const omitDay = 'HH:MM:ss';
  // @ts-expect-error pino pretty does not have a named export
  prettyPrint = pinoPretty.default({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
  });
}

// @ts-expect-error pino does not have a named export
export const logger = pino.default(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
    serializers: Object.assign(Object.create(null), stdSerializers),
  },
  prettyPrint,
);
