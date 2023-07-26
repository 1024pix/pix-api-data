import * as dotenv from 'dotenv';
dotenv.config();
import perf_hooks from 'perf_hooks';
import * as url from 'url';
const { performance } = perf_hooks;
import { logger } from '../lib/common/logger/Logger.ts';
import {
  knexAPI,
  disconnect,
} from '../lib/common/db/knex-database-connections.js';
/* If you use command line args, uncomment me
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).argv;
 */

const doSomething = async (throwError: boolean): Promise<any> => {
  if (throwError) {
    throw new Error('An error occurred');
  }
  const data = await knexAPI.select('id').from('users').first();
  return data;
};

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await doSomething(false);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { doSomething };
