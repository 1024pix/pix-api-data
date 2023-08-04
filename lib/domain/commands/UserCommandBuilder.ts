import type { UUID } from 'crypto';
import { Result } from '../models/Result.js';
import { UserCommandParam } from '../models/UserCommandParam.js';
import { UserCommand } from '../models/UserCommand.js';

export class UserCommandBuilder {
  constructor(private readonly payload: unknown) {}

  build(): Result<UserCommand> {
    const { messages, validatedPayload } = this.validatePayload();
    if (messages.length > 0) {
      return Result.failure(messages);
    }

    const userCommand = new UserCommand(
      validatedPayload.queryId,
      validatedPayload.params,
    );
    return Result.success(userCommand);
  }

  private isValidUUID(id: unknown): id is UUID {
    if (typeof id !== 'string') return false;
    const uuidRegExp: RegExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return uuidRegExp.test(id);
  }

  private isValidParam(myObj: { name: unknown; value: unknown }): boolean {
    const simpleChecks: boolean =
      myObj &&
      myObj.name &&
      typeof myObj.name === 'string' &&
      myObj.value &&
      Object.keys(myObj).length === 2;
    let isValueValid: boolean = false;
    if (simpleChecks) {
      const acceptedPrimitiveTypes = ['string', 'boolean', 'number'].includes(
        typeof myObj.value,
      );
      isValueValid = acceptedPrimitiveTypes || this.isValidArray(myObj.value);
    }
    return simpleChecks && isValueValid;
  }

  private isValidArray(array: unknown): boolean {
    if (!Array.isArray(array)) return false;
    if (array.length === 0) {
      return true;
    }
    const allTypes = array.map((value) => typeof value);
    const uniqTypes = new Set<string>(allTypes);
    if (uniqTypes.size > 1) {
      return false;
    }
    return ['string', 'number'].includes(allTypes[0]);
  }

  private validatePayload(): {
    messages: string[];
    validatedPayload: {
      queryId: UUID;
      params: UserCommandParam[];
    };
  } {
    const messages: string[] = [];
    const validatedPayload: {
      queryId: UUID;
      params: UserCommandParam[];
    } = { queryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', params: [] };
    if (typeof this.payload !== 'object' || !this.payload) {
      messages.push('invalid payload');
    } else {
      Object.keys(this.payload)
        .filter((key) => !['queryId', 'params'].includes(key))
        .forEach((key) => messages.push(`unknown attribute: "${key}"`));

      if (!('queryId' in this.payload)) {
        messages.push('"queryId" is mandatory');
      } else if (!this.isValidUUID(this.payload.queryId)) {
        messages.push('"queryId" is not a valid UUID');
      } else {
        validatedPayload.queryId = this.payload.queryId;
      }

      if (!('params' in this.payload)) {
        messages.push('"params" is mandatory');
      } else if (!Array.isArray(this.payload.params)) {
        messages.push('"params" is not a valid array of params');
      } else {
        for (const item of this.payload.params) {
          if (!this.isValidParam(item)) {
            messages.push(`invalid item in "params": ${JSON.stringify(item)}`);
          } else {
            validatedPayload.params.push(
              new UserCommandParam(item.name, item.value),
            );
          }
        }
      }
    }
    return {
      messages,
      validatedPayload,
    };
  }
}
