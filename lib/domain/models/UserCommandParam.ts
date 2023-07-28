import { ParamType, QueryParam } from '../models/QueryCatalogItem.js';
import moment from 'moment';

export class UserCommandParam {
  name: string;
  value: string | number | boolean | string[] | number[];
  constructor(
    name: string,
    value: string | number | boolean | string[] | number[],
  ) {
    this.name = name;
    this.value = value;
  }

  isValid(paramDefinitions: QueryParam[]) {
    const paramDefinitionType = paramDefinitions.find(
      (paramDefinition) => paramDefinition.name === this.name,
    ).type;
    if (!paramDefinitionType) {
      return false;
    }
    return paramDefinitions && this.checkValue(paramDefinitionType);
  }

  private checkValue(paramDefinitionType: ParamType): boolean {
    switch (paramDefinitionType) {
      case ParamType.STRING:
        return typeof this.value === 'string';
      case ParamType.DATE:
        return this.checkDateFormat('YYYY-MM-DD');
      case ParamType.STRING_ARRAY:
        return (this.value as Array<unknown>).every(
          (item) => typeof item === 'string',
        );
      case ParamType.INT_ARRAY:
      case ParamType.FLOAT_ARRAY:
        return (this.value as Array<unknown>).every(
          (item) => typeof item === 'number',
        );
      case ParamType.BOOLEAN:
        return typeof this.value === 'boolean';
      case ParamType.INT:
      case ParamType.FLOAT:
        return typeof this.value === 'number';
      case ParamType.DATE_TIME:
        return this.checkDateFormat('YYYY-MM-DD HH:mm:ss');
    }
  }
  private checkDateFormat(pattern: string): boolean {
    return (
      typeof this.value === 'string' &&
      moment(this.value, pattern, true).isValid()
    );
  }
}
