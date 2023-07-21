import { knexDatamart } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import { DatamartQueryModel } from '../domain/models/DatamartQuery.ts';
import { DatamartResponse } from '../domain/models/DatamartResponse.ts';
import { QueryBuilder } from './builder/QueryBuilder.ts';

export interface DatamartRepository {
  find(datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse>;
}
class DatamartRepositoryImpl implements DatamartRepository {
  async find(
    datamartQueryModel: DatamartQueryModel,
  ): Promise<DatamartResponse> {
    const queryBuilder = new QueryBuilder(datamartQueryModel);
    try {
      // eslint-disable-next-line knex/avoid-injections
      const result = await knexDatamart.raw(queryBuilder.build());
      return result['rows'];
    } catch (e) {
      logger.error(
        `Error while executing query: ${datamartQueryModel.query}`,
        e,
      );
    }
  }
}

export const datamartRepository: DatamartRepository =
  new DatamartRepositoryImpl();
