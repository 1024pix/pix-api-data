type RequestCatalogItem = {
  query: string;
  mandatoryParams: RequestParam[];
  optionalParams: RequestParam[];
};

type RequestParam = {
  name: string;
  type: ParamType;
};

enum ParamType {
  STRING = 'string',
  INT = 'int',
  DATE = 'date',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  STRING_ARRAY = 'string-array',
  INT_ARRAY = 'int-array',
  DATE_ARRAY = 'date-array',
  FLOAT_ARRAY = 'float-array',
}
