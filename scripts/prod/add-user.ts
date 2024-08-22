import process from 'node:process';
import perf_hooks from 'node:perf_hooks';
import * as url from 'node:url';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  disconnect,
  knexAPI,
} from '../../lib/common/db/knex-database-connections.js';
import { logger } from '../../lib/common/logger/Logger.js';
import { encryptionService } from '../../lib/infrastructure/utils/EncryptionService.js';

dotenv.config();
const { performance } = perf_hooks;
const parseMe = yargs(hideBin(process.argv))
  .option('username', {
    type: 'string',
    description: 'Nom utilisateur',
  })
  .option('label', {
    type: 'string',
    description: 'Label utilisateur',
  })
  .option('password', {
    type: 'string',
    description: 'Mot de passe utilisateur',
  })
  .help();

async function addUser(user: User): Promise<void> {
  const hashedPassword = await encryptionService.hashPassword(user.password);
  try {
    const [userDTO] = await knexAPI('users')
      .insert({
        username: user.username,
        label: user.label,
        hashed_password: hashedPassword,
      })
      .returning(['username', 'label', 'id']);
    logger.info(
      `Utilisateur créé avec succès : id - ${userDTO.id} | username - ${userDTO.username} | label - ${userDTO.label}`,
    );
  }
  catch (err) {
    logger.error('Something went wrong when adding user');
    throw err;
  }
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

export interface User {
  username: string;
  label: string;
  password: string;
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const user: User = await parseMe.argv;
  await addUser(user);
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

export { addUser };
