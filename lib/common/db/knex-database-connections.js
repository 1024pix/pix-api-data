import pg from 'pg';

const types = pg.types;
import { config } from '../config.js';

import _ from 'lodash';

import Knex from 'knex';

/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
types.setTypeParser(types.builtins.DATE, (value) => value);

/*
The method Bookshelf.Model.count(), used with PostgreSQL, can sometimes returns a BIGINT.
This is not the common case (maybe in several years).
Even though, Bookshelf/Knex have decided to return String.
We decided to parse the result of #count() method to force a resulting INTEGER.

Links :
- problem: https://github.com/bookshelf/bookshelf/issues/1275
- solution: https://github.com/brianc/node-pg-types
 */
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value));

import * as datamartKnexConfigs from './knexfile_datamart.js';
import * as apiKnexConfigs from './knexfile_api.js';

const { environment } = config;
const datamartKnexConfig = datamartKnexConfigs.default[environment];
const configuredDatamartKnex = Knex(datamartKnexConfig);

const apiKnexConfig = apiKnexConfigs.default[environment];
const configuredAPIKnex = Knex(apiKnexConfig);

async function disconnect() {
  await configuredDatamartKnex.destroy();
  return configuredAPIKnex.destroy();
}

const _dbSpecificQueries = {
  listTablesQuery:
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
  emptyTableQuery: 'TRUNCATE ',
};

async function listAllTableNamesOfAPIDatabase() {
  const databaseName = configuredAPIKnex.client.database();
  const bindings = [databaseName];
  const resultSet = await configuredAPIKnex.raw(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    bindings,
  );

  const rows = resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTablesOfAPIDatabase() {
  const tableNames = await listAllTableNamesOfAPIDatabase();
  const tablesToDelete = _.without(
    tableNames,
    'knex_migrations',
    'knex_migrations_lock',
    'view-active-organization-learners',
  );

  const tables = _.map(
    tablesToDelete,
    (tableToDelete) => `"${tableToDelete}"`,
  ).join();

  const query = _dbSpecificQueries.emptyTableQuery;
  // eslint-disable-next-line knex/avoid-injections
  return configuredAPIKnex.raw(`${query}${tables}`);
}

export {
  configuredAPIKnex as knexAPI,
  configuredDatamartKnex as knexDatamart,
  emptyAllTablesOfAPIDatabase,
  disconnect,
};
