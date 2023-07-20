import { knex } from '../common/db/knex-database-connection.js';
import { logger } from '../common/logger/logger.js';

export async function executeQuery(query: string): Promise<[]> {
  try {
    const result = await knex.raw(query);
    return result['rows'];
  } catch (e) {
    logger.error(`Error while executing query: ${query}`, e);
  }
}
