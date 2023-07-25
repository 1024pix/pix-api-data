import { UUID } from 'crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import {
  QueryCatalogItem,
  QueryParam,
} from '../domain/models/QueryCatalogItem.ts';

export interface CatalogQueryRepository {
  find(_requestId: UUID): Promise<QueryCatalogItem>;
}
class CatalogQueryRepositoryImpl implements CatalogQueryRepository {
  async find(queryId: UUID): Promise<QueryCatalogItem> {
    try {
      const catalogQueryDTO = await knexAPI('catalog_queries')
        .select(['sql_query'])
        .where('id', queryId)
        .first();
      const catalogQueryParamsDTO = await knexAPI('catalog_query_params')
        .select(['name', 'type', 'mandatory'])
        .where('catalog_query_id', queryId);
      return {
        query: catalogQueryDTO?.['sql_query'],
        params: catalogQueryParamsDTO.map(
          (paramDTO: { name: string; type: string; mandatory: boolean }) =>
            ({
              name: paramDTO.name,
              type: paramDTO.type,
              mandatory: paramDTO.mandatory,
            } as QueryParam),
        ),
      };
    } catch (e) {
      logger.error(`Error when fetching query for id : ${queryId}`, e);
    }
  }
}

export const catalogQueryRepository: CatalogQueryRepository =
  new CatalogQueryRepositoryImpl();
