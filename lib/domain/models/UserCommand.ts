import type { UUID } from 'crypto';
import type { UserCommandParam } from './UserCommandParam';
import type { QueryParam } from '../models/QueryCatalogItem';

export class UserCommand {
  queryId: UUID;
  params: UserCommandParam[];

  constructor(queryId: UUID, params: UserCommandParam[]) {
    this.queryId = queryId;
    this.params = params;
  }
  isValid(paramDefinitions: QueryParam[]) {
    return this.params.every((paramValue) =>
      paramValue.isValid(paramDefinitions),
    );
  }
}
