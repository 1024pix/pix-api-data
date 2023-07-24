export type QueryCatalogItem = {
  query: string;
  params: QueryParam[];
};

export type QueryParam = {
  name: string;
  type: ParamType;
  mandatory: boolean;
};

export enum ParamType {
  STRING = 'string',
  INT = 'int',
  DATE = 'date',
  DATE_TIME = 'date-time',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  STRING_ARRAY = 'string-array',
  INT_ARRAY = 'int-array',
  FLOAT_ARRAY = 'float-array',
}
