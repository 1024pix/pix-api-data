import type { UserCommandParam } from '../commands/UserCommand.js';

export type QueryAccess = {
  [key: string]: string[];
};

export class QueryAccessModel {
  constructor(private queryAccess: QueryAccess) {}

  get paramsAccess() {
    return this.queryAccess;
  }

  areParamsValid(params: UserCommandParam[]): boolean {
    return params.every((param) => {
      return this.queryAccess[param.name]?.includes(param.value.toString());
    });
  }
}
