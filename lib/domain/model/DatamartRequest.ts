import { UserCommandParam } from '../UserCommand.js';
import { RequestParam } from '../RequestCatalogItem.js';

export type DatamartRequest = {
  query: string;
  paramValues: UserCommandParam[];
  paramDefinitions: RequestParam[];
};
