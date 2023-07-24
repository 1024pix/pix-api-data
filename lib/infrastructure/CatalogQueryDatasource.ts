import { UUID } from 'crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import { QueryCatalogItem } from '../domain/models/QueryCatalogItem.ts';

export interface CatalogQueryRepository {
  find(_requestId: UUID): Promise<QueryCatalogItem>;
}
class CatalogQueryRepositoryImpl implements CatalogQueryRepository {
  async find(queryId: UUID): Promise<QueryCatalogItem> {
    try {
      const result = await knexAPI('catalog_queries')
        .select(['sql_query'])
        .where('id', queryId)
        .first();
      return {
        query: result?.['sql_query'],
        params: [],
      };
    } catch (e) {
      logger.error(`Error when fetching query for id : ${queryId}`, e);
    }
  }
}

export const catalogQueryRepository: CatalogQueryRepository =
  new CatalogQueryRepositoryImpl();
