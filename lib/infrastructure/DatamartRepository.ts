import { knexDatamart } from '../common/db/knex-database-connections.js';
import type { DatamartResponse } from '../domain/models/DatamartResponse.js';
import type { DatamartQueryModel } from '../domain/models/DatamartQuery.js';
import { QueryBuilder } from './builder/QueryBuilder.js';

export interface DatamartRepository {
  find: (datamartQueryModel: DatamartQueryModel) => DatamartResponse;
}
class DatamartRepositoryImpl implements DatamartRepository {
  find(
    datamartQueryModel: DatamartQueryModel,
  ): DatamartResponse {
    const queryBuilder = new QueryBuilder(datamartQueryModel);
    const knexQuery = queryBuilder.build();
    const stream = knexDatamart.raw(knexQuery.query, knexQuery.params).stream();
    return {
      result: stream,
    } as DatamartResponse;
  }
}

export const datamartRepository: DatamartRepository
  = new DatamartRepositoryImpl();
