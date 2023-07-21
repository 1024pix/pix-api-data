import { knexDatamart } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import { DatamartQuery } from '../domain/models/DatamartQuery.ts';
import { DatamartResponse } from '../domain/models/DatamartResponse.ts';
import { RequestBuilder } from './builder/RequestBuilder.ts';

export interface DatamartRepository {
  find(_datamartQuery: DatamartQuery): Promise<DatamartResponse>;
}
class DatamartRepositoryImpl implements DatamartRepository {
  async find(datamartQuery: DatamartQuery): Promise<DatamartResponse> {
    const requestBuilder = new RequestBuilder(datamartQuery);
    try {
      // eslint-disable-next-line knex/avoid-injections
      const result = await knexDatamart.raw(requestBuilder.build());
      return result['rows'];
    } catch (e) {
      logger.error(`Error while executing query: ${datamartQuery.query}`, e);
    }
  }
}

export const datamartRepository: DatamartRepository =
  new DatamartRepositoryImpl();
