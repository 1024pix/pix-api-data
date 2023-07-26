import {
  DatamartQueryModel,
  MATCHING_PARAM_BLOCK_REGEXP,
  PARAM_NAME_REGEXP,
} from '../../domain/models/DatamartQuery.js';

const REMOVE_OPTIONAL_CHAR_REGEXP = /\[{2}((.|\n|\r)*)]{2}/;
type KnexParams = {
  [key: string]: string | number | boolean | string[] | number[];
};
type KnexQuery = {
  query: string;
  params: KnexParams;
};

export class QueryBuilder {
  queryInputOneLine: string;

  constructor(private readonly datamartRequestModel: DatamartQueryModel) {
    this.queryInputOneLine = datamartRequestModel.query;
  }

  build(): KnexQuery {
    const queryWithoutSomeOptional = this.manageOptionals(
      this.queryInputOneLine,
    );

    return {
      query: this.buildQuery(queryWithoutSomeOptional),
      params: this.buildParams(),
    } as KnexQuery;
  }

  private buildQuery(query: string): string {
    let queryResult = query;
    this.datamartRequestModel.paramValues.forEach((paramValue) => {
      queryResult = queryResult.replace(
        `{{ ${paramValue.name} }}`,
        `:${paramValue.name}`,
      );
    });
    return queryResult;
  }

  private buildParams(): KnexParams {
    const params: KnexParams = {};
    this.datamartRequestModel.paramValues.forEach((userCommandParam) => {
      params[userCommandParam.name] = userCommandParam.value;
    });
    return params;
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
    return (
      [...optional.matchAll(MATCHING_PARAM_BLOCK_REGEXP)]
        .map((regExpMatchArray) => regExpMatchArray[0])
        /* example: {{ myParam }}. $1 = " myParam " */
        .map((paramNeed) => paramNeed.replace(PARAM_NAME_REGEXP, '$1').trim())
        .every((paramNeed) =>
          this.datamartRequestModel.paramValueNames.includes(paramNeed),
        )
    );
  }
}
