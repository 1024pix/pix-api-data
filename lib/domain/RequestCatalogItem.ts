export type RequestCatalogItem = {
  query: string;
  params: RequestParam[];
};

export type RequestParam = {
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
