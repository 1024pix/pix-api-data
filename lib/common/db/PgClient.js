import pg from 'pg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { logger } from '../logger/Logger.ts';

const { Client } = pg;

export class PgClient {
  constructor(databaseUrl) {
    this.client = new Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10000,
    });
  }

  static async getClient(databaseUrl) {
    const instance = new PgClient(databaseUrl);
    try {
      await instance.client.connect();
    } catch (error) {
      logger.error('Database error', error);
    }
    return instance;
  }

  end() {
    return this.client.end();
  }

  query_and_log(query) {
    logger.info(`query: ${query}`);
    return this.client.query(query).then((result) => {
      const { command, rowCount, rows } = result;
      logger.info(
        `result: command ${command} (rowCount ${rowCount}) = ${JSON.stringify(
          rows,
        )}`,
      );
      return result;
    });
  }
}
