import { knex } from "../../db/knex-database-connection.js";
import { logger } from "./logger.js";

export async function executeQuery(query) {
  logger.error('Tout marche bien navette');
  try {
    const result = await knex.raw(query)
    return result.rows;
  } catch (e) {
    logger.error(`Error while executing query: ${query}`, e);
  }
}
