import { UserCommandParam } from './UserCommand.ts';
import { ParamType, QueryParam } from './QueryCatalogItem.ts';

export interface DatamartQuery {
  query: string;
  paramValues: UserCommandParam[];
  paramDefinitions: QueryParam[];
}
export const MATCHING_OPTIONAL_BLOCK_REGEXP = /((?:\[{2}.*?]{2})+),?/;
export const MATCHING_PARAM_BLOCK_REGEXP = /((?:{{.*?}})+),?/;
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
    return MATCHING_OPTIONAL_BLOCK_REGEXP.exec(this.query) ?? [];
  }

  isValid(): boolean {
    return (
      this.checkMandatoryParams() &&
      this.checkOptionalParams() &&
      this.checkValueTypes()
    );
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
        MATCHING_PARAM_BLOCK_REGEXP.exec(optional)
          .map((paramNeed) => paramNeed.replace(PARAM_NAME_REGEXP, '$1').trim())
          .map((paramNeed) => this.paramValueNames.includes(paramNeed)),
      ).size === 1
    );
  }

  private checkValueTypes(): boolean {
    return this.paramValues.every((paramValue) => {
      return this.checkValue(
        paramValue.value,
        this.paramDefinitions.find(
          (paramDefinition) => paramDefinition.name === paramValue.name,
        ).type,
      );
    });
  }

  private checkValue(
    value: string | number | boolean | string[] | number[],
    paramDefinitionType: ParamType,
  ): boolean {
    switch (paramDefinitionType) {
      case ParamType.STRING:
      case ParamType.DATE:
        return typeof value === 'string';
      case ParamType.STRING_ARRAY:
        return (value as Array<unknown>).every(
          (item) => typeof item === 'string',
        );
      case ParamType.INT_ARRAY:
      case ParamType.FLOAT_ARRAY:
        return (value as Array<unknown>).every(
          (item) => typeof item === 'number',
        );
      case ParamType.BOOLEAN:
        return typeof value === 'boolean';
      case ParamType.INT:
      case ParamType.FLOAT:
        return typeof value === 'number';
    }
  }
}
