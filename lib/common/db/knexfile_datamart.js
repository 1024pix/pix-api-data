import * as url from 'node:url';
import { env } from 'node:process';
import * as dotenv from 'dotenv';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: `${__dirname}/../.env` });

function localDatamartPostgresEnv(databaseUrl, knexAsyncStacktraceEnabled) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: 1,
      max: 4,
    },
    asyncStackTraces: knexAsyncStacktraceEnabled !== 'false',
  };
}
const environments = {
  development: localDatamartPostgresEnv(
    env.DATABASE_DATAMART_URL,
    env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  test: localDatamartPostgresEnv(
    env.TEST_DATABASE_DATAMART_URL,
    env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  production: {
    client: 'postgresql',
    connection: env.DATABASE_DATAMART_URL,
    pool: {
      min:
        Number.parseInt(
          env.DATABASE_DATAMART_CONNECTION_POOL_MIN_SIZE,
          10,
        ) || 1,
      max:
        Number.parseInt(
          env.DATABASE_DATAMART_CONNECTION_POOL_MAX_SIZE,
          10,
        ) || 1,
    },
    asyncStackTraces:
      env.KNEX_ASYNC_STACKTRACE_ENABLED_DATAMART !== 'false',
  },
};

export default environments;
