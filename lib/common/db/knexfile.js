import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';
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
    process.env.DATABASE_DATAMART_URL,
    process.env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  test: localDatamartPostgresEnv(
    process.env.TEST_DATABASE_DATAMART_URL,
    process.env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_DATAMART_URL,
    pool: {
      min:
        parseInt(process.env.DATABASE_DATAMART_CONNECTION_POOL_MIN_SIZE, 10) ||
        1,
      max:
        parseInt(process.env.DATABASE_DATAMART_CONNECTION_POOL_MAX_SIZE, 10) ||
        1,
    },
    asyncStackTraces:
      process.env.KNEX_ASYNC_STACKTRACE_ENABLED_DATAMART !== 'false',
  },
};

export default environments;
