import * as dotenv from 'dotenv';

dotenv.config();

import { createServer } from './server.ts';
import { Server } from '@hapi/hapi';
import { logger } from './common/logger/Logger.ts';

let server: Server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal() {
  await server.stop({ timeout: 30000 });
}

const SIGTERM = 'SIGTERM';
process.on(SIGTERM, () => {
  _exitOnSignal().then(() => {
    logger.info(SIGTERM);
  });
});
const SIGINT = 'SIGINT';
process.on(SIGINT, () => {
  _exitOnSignal().then(() => {
    logger.info(SIGINT);
  });
});

(async () => {
  try {
    await start();
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
