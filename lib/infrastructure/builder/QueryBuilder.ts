import { DatamartQuery } from '../../domain/models/DatamartQuery.ts';
import { UserCommandParam } from '../../domain/models/UserCommand.ts';
import { ParamType, QueryParam } from '../../domain/models/QueryCatalogItem.ts';

const CARRIAGE_RETURN_REGEXP = /[\r\n]/g;
const MATCHING_OPTIONAL_BLOCK_REGEXP = /((?:\[{2}.*?]{2})+),?/;
const REMOVE_OPTIONAL_CHAR_REGEXP = /\[{2}(.*)]{2}/;
const MATCHING_PARAM_BLOCK_REGEXP = /((?:{{.*?}})+),?/;
const PARAM_NAME_REGEXP = /{{(.*)}}/;

export class QueryBuilder {
  queryInputOneLine: string;

  constructor(private readonly datamartQuery: DatamartQuery) {
    this.queryInputOneLine = datamartQuery.query.replace(
      CARRIAGE_RETURN_REGEXP,
      ' ',
    );
  }

  build(): string {
    const queryWithoutSomeOptional = manageOptionals(
      this.queryInputOneLine,
      this.datamartQuery.paramValues.map((paramValue) => paramValue.name),
    );
    return injectValues(
      queryWithoutSomeOptional,
      this.datamartQuery.paramValues,
      this.datamartQuery.paramDefinitions,
    );
  }
}

function injectValues(
  query: string,
  paramValues: UserCommandParam[],
  paramDefinitions: QueryParam[],
): string {
  let queryResult = query;
  paramValues.forEach((paramValue) => {
    queryResult = queryResult.replace(
      `{{ ${paramValue.name} }}`,
      buildValue(paramValue, paramDefinitions),
    );
  });
  return queryResult;
}

function buildValue(
  paramValue: UserCommandParam,
  paramDefinitions: QueryParam[],
): string {
  const paramDefinition = paramDefinitions.find(
    (paramDefinition) => paramDefinition.name === paramValue.name,
  );

  // TODO sanitize ?
  switch (paramDefinition.type) {
    case ParamType.STRING:
    case ParamType.DATE:
      return `'${paramValue.value}'`;
    case ParamType.STRING_ARRAY:
      return (paramValue.value as Array<string>)
        .map((value) => `'${value}'`)
        .join(', ')
        .trim();
    case ParamType.INT_ARRAY:
    case ParamType.FLOAT_ARRAY:
      return (paramValue.value as Array<number>).join(', ').trim();
    default:
      // case ParamType.BOOLEAN:
      // case ParamType.INT:
      // case ParamType.FLOAT:
      return `${paramValue.value}`;
  }
}

function manageOptionals(query: string, paramValueNames: string[]): string {
  let queryResult = query;
  const optionals = MATCHING_OPTIONAL_BLOCK_REGEXP.exec(query);

  optionals?.forEach((optional) => {
    if (checkOptionalNeed(optional, paramValueNames)) {
      queryResult = queryResult.replace(
        optional,
        optional.replace(REMOVE_OPTIONAL_CHAR_REGEXP, '$1'),
      );
    } else {
      queryResult = queryResult.replace(optional, '');
    }
  });
  return queryResult.trim();
}

function checkOptionalNeed(
  optional: string,
  paramValueNames: string[],
): boolean {
  return MATCHING_PARAM_BLOCK_REGEXP.exec(optional)
    .map((paramNeed) => paramNeed.replace(PARAM_NAME_REGEXP, '$1').trim())
    .every((paramNeed) => paramValueNames.includes(paramNeed));
}
