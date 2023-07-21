import { UserCommandParam } from './UserCommand.ts';
import { RequestParam } from './RequestCatalogItem.ts';

export type DatamartRequest = {
  query: string;
  paramValues: UserCommandParam[];
  paramDefinitions: RequestParam[];
};
