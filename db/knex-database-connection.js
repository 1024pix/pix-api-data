import pg from 'pg';

const types = pg.types;
import _ from 'lodash';

const { get } = _;
import { config } from '../lib/config.js';

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

import * as knexConfigs from './knexfile.js';

const { logging, environment } = config;
const knexConfig = knexConfigs.default[environment];
const configuredKnex = Knex(knexConfig);

async function disconnect() {
  return configuredKnex.destroy();
}

export { configuredKnex as knex, disconnect };
