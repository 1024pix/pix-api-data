import { knexDatamart } from '../common/db/knex-database-connections.js';
import type { DatamartResponse } from '../domain/models/DatamartResponse.js';
import { QueryBuilder } from './builder/QueryBuilder.js';
import type { DatamartQueryModel } from '../domain/models/DatamartQuery.js';

export interface DatamartRepository {
  find(datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse>;
}
class DatamartRepositoryImpl implements DatamartRepository {
  async find(
    datamartQueryModel: DatamartQueryModel,
  ): Promise<DatamartResponse> {
    const queryBuilder = new QueryBuilder(datamartQueryModel);
    const knexQuery = queryBuilder.build();
    const result = await knexDatamart.raw(knexQuery.query, knexQuery.params);
    return {
      result: result['rows'],
    } as DatamartResponse;
  }
}

export const datamartRepository: DatamartRepository =
  new DatamartRepositoryImpl();
