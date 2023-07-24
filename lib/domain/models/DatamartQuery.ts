import { UserCommandParam } from './UserCommand.ts';
import { QueryParam } from './QueryCatalogItem.ts';

export type DatamartQuery = {
  query: string;
  paramValues: UserCommandParam[];
  paramDefinitions: QueryParam[];
};
