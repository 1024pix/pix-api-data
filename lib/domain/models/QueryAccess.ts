export type QueryAccess = {
  [key: string]: string[];
};

export class QueryAccessModel {
  constructor(private queryAccess: QueryAccess) {}

  get paramsAccess() {
    return this.queryAccess;
  }
}
