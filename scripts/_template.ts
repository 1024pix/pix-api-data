import perf_hooks from 'node:perf_hooks';
import process from 'node:process';
import * as url from 'node:url';
import * as dotenv from 'dotenv';
import {
  disconnect,
  knexAPI,
} from '../lib/common/db/knex-database-connections.js';
import { logger } from '../lib/common/logger/Logger.js';

dotenv.config();
const { performance } = perf_hooks;
/* If you use command line args, uncomment me
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).argv;
 */

async function doSomething(throwError: boolean): Promise<any> {
  if (throwError) {
    throw new Error('An error occurred');
  }
  const data = await knexAPI.select('id').from('users').first();
  return data;
}

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
    }
    catch (error) {
      logger.error(error);
      process.exit(1);
    }
    finally {
      await disconnect();
    }
  }
})();

export { doSomething };
