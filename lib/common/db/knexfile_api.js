import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../../../.env` });

function localAPIPostgresEnv(databaseUrl, knexAsyncStacktraceEnabled) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: 1,
      max: 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: './seeds',
      loadExtensions: ['.js'],
    },
    asyncStackTraces: knexAsyncStacktraceEnabled !== 'false',
  };
}
const environments = {
  development: localAPIPostgresEnv(
    process.env['DATABASE_API_URL'],
    process.env['KNEX_ASYNC_STACKTRACE_ENABLED'],
  ),

  test: localAPIPostgresEnv(
    process.env['TEST_DATABASE_API_URL'],
    process.env['KNEX_ASYNC_STACKTRACE_ENABLED'],
  ),

  production: {
    client: 'postgresql',
    connection: process.env['DATABASE_API_URL'],
    pool: {
      min:
        parseInt(process.env['DATABASE_API_CONNECTION_POOL_MIN_SIZE'], 10) || 1,
      max:
        parseInt(process.env['DATABASE_API_CONNECTION_POOL_MAX_SIZE'], 10) || 1,
    },
    asyncStackTraces:
      process.env['KNEX_ASYNC_STACKTRACE_ENABLED_API'] !== 'false',
  },
};

export default environments;
