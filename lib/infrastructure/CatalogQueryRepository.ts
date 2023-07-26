import type { UUID } from 'crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';
import type {
  QueryCatalogItem,
  QueryParam,
} from '../domain/models/QueryCatalogItem.js';

export interface CatalogQueryRepository {
  find(_requestId: UUID): Promise<QueryCatalogItem>;
}
class CatalogQueryRepositoryImpl implements CatalogQueryRepository {
  async find(queryId: UUID): Promise<QueryCatalogItem> {
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
    } as QueryCatalogItem;
  }
}

export const catalogQueryRepository: CatalogQueryRepository =
  new CatalogQueryRepositoryImpl();
