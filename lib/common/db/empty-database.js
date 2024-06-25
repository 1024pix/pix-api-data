import { logger } from '../logger/Logger.js';
import {
  disconnect,
  emptyAllTablesOfAPIDatabase,
} from './knex-database-connections.js';

const main = async () => {
  logger.info('Emptying all tables...');
  await emptyAllTablesOfAPIDatabase();
  logger.info('Done!');
};

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
