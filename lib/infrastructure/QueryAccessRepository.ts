import type { UUID } from 'node:crypto';

import { knexAPI } from '../common/db/knex-database-connections.js';
import { NotFoundError } from '../domain/errors.js';
import {
  type QueryAccess,
  QueryAccessModel,
} from '../domain/models/QueryAccess.js';

export interface QueryAccessRepository {
  get: (_queryId: UUID, _userId: UUID) => Promise<QueryAccessModel>;
}

interface queryParamsAccessDTO {
  name: string;
  value: string;
}

class QueryAccessRepositoryImpl implements QueryAccessRepository {
  async get(queryId: UUID, userId: UUID): Promise<QueryAccessModel> {
    const queryAccess = await knexAPI('query_access')
      .where('user_id', userId)
      .where('query_id', queryId)
      .first();

    if (!queryAccess) {
      throw new NotFoundError('Query access not found');
    }

    const queryParamsAccessDTO: queryParamsAccessDTO[] = await knexAPI('query_param_access')
      .select(['name', 'value'])
      .innerJoin(
        'catalog_query_params',
        'query_param_access.query_param_id',
        'catalog_query_params.id',
      )
      .where('catalog_query_id', queryId)
      .where('user_id', userId);

    const queryParamsAccess = transformToQueryAccess(queryParamsAccessDTO);
    return new QueryAccessModel(queryParamsAccess);
  }
}

function transformToQueryAccess(
  queryParams: queryParamsAccessDTO[],
): QueryAccess {
  return queryParams.reduce((acc, queryParamAccess) => {
    if (acc[queryParamAccess.name]) {
      acc[queryParamAccess.name].push(queryParamAccess.value);
    }
    else {
      acc[queryParamAccess.name] = [queryParamAccess.value];
    }
    return acc;
  }, {}) as QueryAccess;
}

export const queryAccessRepository: QueryAccessRepository
  = new QueryAccessRepositoryImpl();
