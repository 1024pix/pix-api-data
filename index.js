import * as dotenv from 'dotenv';

dotenv.config();

import { createServer } from './server.js';

let server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal(signal) {
  await server.stop({ timeout: 30000 });
}

process.on('SIGTERM', () => {
  _exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  _exitOnSignal('SIGINT');
});

(async () => {
  try {
    await start();
  } catch (error) {
    // logger.error(error);
    throw error;
  }
})();
