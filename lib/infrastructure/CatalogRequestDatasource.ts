import { UUID } from 'crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';
import { logger } from '../common/logger/logger.js';
import { RequestCatalogItem } from '../domain/models/RequestCatalogItem.ts';

export interface CatalogRequestRepository {
  find(_requestId: UUID): Promise<RequestCatalogItem>;
}
class CatalogRequestRepositoryImpl implements CatalogRequestRepository {
  async find(requestId: UUID): Promise<RequestCatalogItem> {
    try {
      const result = await knexAPI('catalog_requests')
        .select(['request'])
        .where('id', requestId)
        .first();
      return {
        query: result?.request,
        params: [],
      };
    } catch (e) {
      logger.error(`Error when fetching request for id : ${requestId}`, e);
    }
  }
}

export const catalogRequestRepository: CatalogRequestRepository =
  new CatalogRequestRepositoryImpl();
