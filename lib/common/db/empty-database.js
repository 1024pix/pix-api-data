import {
  emptyAllTablesOfAPIDatabase,
  disconnect,
} from './knex-database-connections.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { logger } from '../logger/Logger.ts';

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
