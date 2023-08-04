import type { QueryParam } from './QueryCatalogItem.js';
import type { UserCommandParam } from './UserCommandParam';

export interface DatamartQuery {
  query: string;
  paramValues: UserCommandParam[];
  paramDefinitions: QueryParam[];
}

export const MATCHING_OPTIONAL_BLOCK_REGEXP =
  /((?:\[{2}(?:.|\n|\r)*?]{2})+),?/g;
export const MATCHING_PARAM_BLOCK_REGEXP = /((?:{{.*?}})+),?/g;
export const PARAM_NAME_REGEXP = /{{(.*)}}/;

export class DatamartQueryModel {
  constructor(private readonly datamartQuery: DatamartQuery) {}
  get query() {
    return this.datamartQuery.query;
  }

  get paramDefinitions() {
    return this.datamartQuery.paramDefinitions;
  }

  get paramValues() {
    return this.datamartQuery.paramValues;
  }

  get paramValueNames(): string[] {
    return this.paramValues.map((paramValue) => paramValue.name);
  }

  get optionalBlocks(): string[] {
    const regExpMatchArrays = [
      ...this.query.matchAll(MATCHING_OPTIONAL_BLOCK_REGEXP),
    ];
    return regExpMatchArrays.map((regExpMatchArray) => regExpMatchArray[0]);
  }

  isValid(): boolean {
    return this.checkMandatoryParams() && this.checkOptionalParams();
  }

  private checkMandatoryParams(): boolean {
    return this.paramDefinitions
      .filter(({ mandatory }) => mandatory)
      .every(({ name }) => this.paramValueNames.includes(name));
  }

  private checkOptionalParams(): boolean {
    return (
      this.optionalBlocks.every((optional) =>
        this.checkOptionalMissingArgumentIsOk(optional),
      ) ?? true
    );
  }

  private checkOptionalMissingArgumentIsOk(optional: string): boolean {
    return (
      new Set(
        [...optional.matchAll(MATCHING_PARAM_BLOCK_REGEXP)]
          .map((regExpMatchArray) => regExpMatchArray[0])
          /* example: {{ myParam }}. $1 = " myParam " */
          .map((paramNeed) => paramNeed.replace(PARAM_NAME_REGEXP, '$1').trim())
          .map((paramNeed) => this.paramValueNames.includes(paramNeed)),
      ).size === 1
    );
  }
}
