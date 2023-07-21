import { knexDatamart } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import { DatamartRequest } from '../domain/models/DatamartRequest.ts';
import { DatamartResponse } from '../domain/models/DatamartResponse.ts';

export interface DatamartRepository {
  find(datamartRequest: DatamartRequest): Promise<DatamartResponse>;
}
class DatamartRepositoryImpl implements DatamartRepository {
  async find(datamartRequest: DatamartRequest): Promise<DatamartResponse> {
    try {
      const result = await knexDatamart.raw(datamartRequest.query);
      return result['rows'];
    } catch (e) {
      logger.error(`Error while executing query: ${datamartRequest.query}`, e);
    }
  }
}

export const datamartRepository: DatamartRepository =
  new DatamartRepositoryImpl();
