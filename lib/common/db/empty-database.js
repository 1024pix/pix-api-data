import process from 'node:process';
import { logger } from '../logger/Logger.js';
import {
  disconnect,
  emptyAllTablesOfAPIDatabase,
} from './knex-database-connections.js';

async function main() {
  logger.info('Emptying all tables...');
  await emptyAllTablesOfAPIDatabase();
  logger.info('Done!');
}

(async () => {
  try {
    await main();
  }
  catch (error) {
    logger.error(error);
    process.exit(1);
  }
  finally {
    await disconnect();
  }
})();
