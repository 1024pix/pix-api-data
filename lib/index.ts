import * as dotenv from 'dotenv';

dotenv.config();

import type { Server } from '@hapi/hapi';
import { logger } from './common/logger/Logger.js';
import { createServer } from './server.js';
import { disconnect } from './common/db/knex-database-connections.js';
let server: Server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal() {
  try {
    await server.stop({ timeout: 30000 });
    await disconnect();
  } catch (error) {
    logger.error("Erreur lors de l'arrêt du serveur:", error);
  }
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
