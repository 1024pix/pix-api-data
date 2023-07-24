import {
  DatamartQueryModel,
  MATCHING_PARAM_BLOCK_REGEXP,
  PARAM_NAME_REGEXP,
} from '../../domain/models/DatamartQuery.ts';
import { UserCommandParam } from '../../domain/models/UserCommand.ts';
import { ParamType } from '../../domain/models/QueryCatalogItem.ts';

const CARRIAGE_RETURN_REGEXP = /[\r\n]/g;
const REMOVE_OPTIONAL_CHAR_REGEXP = /\[{2}(.*)]{2}/;

export class QueryBuilder {
  queryInputOneLine: string;

  constructor(private readonly datamartRequestModel: DatamartQueryModel) {
    this.queryInputOneLine = datamartRequestModel.query.replace(
      CARRIAGE_RETURN_REGEXP,
      ' ',
    );
  }

  build(): string {
    const queryWithoutSomeOptional = this.manageOptionals(
      this.queryInputOneLine,
    );
    return this.injectValues(queryWithoutSomeOptional);
  }
  private injectValues(query: string): string {
    let queryResult = query;
    this.datamartRequestModel.paramValues.forEach((paramValue) => {
      queryResult = queryResult.replace(
        `{{ ${paramValue.name} }}`,
        this.buildValue(paramValue),
      );
    });
    return queryResult;
  }

  private buildValue(paramValue: UserCommandParam): string {
    const paramDefinition = this.datamartRequestModel.paramDefinitions.find(
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

  private manageOptionals(query: string): string {
    let queryResult = query;

    this.datamartRequestModel.optionalBlocks.forEach((optional) => {
      if (this.checkOptionalNeed(optional)) {
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

  private checkOptionalNeed(optional: string): boolean {
    return MATCHING_PARAM_BLOCK_REGEXP.exec(optional)
      .map((paramNeed) => paramNeed.replace(PARAM_NAME_REGEXP, '$1').trim())
      .every((paramNeed) =>
        this.datamartRequestModel.paramValueNames.includes(paramNeed),
      );
  }
}
