import { UUID } from 'crypto';
import { Result } from './Result.ts';

export class UserCommand {
  queryId: UUID;
  params: UserCommandParam[];

  constructor(queryId: UUID, params: UserCommandParam[]) {
    this.queryId = queryId;
    this.params = params;
  }

  static buildFromPayload(payload: unknown): Result<UserCommand> {
    const { messages, validatedPayload } = validatePayload(payload);
    if (messages.length > 0) {
      return Result.failure(messages);
    }

    const userCommand = new UserCommand(
      validatedPayload.queryId,
      validatedPayload.params,
    );
    return Result.success(userCommand);
  }
}

export type UserCommandParam = {
  name: string;
  value: string | number | boolean | string[] | number[];
};

function isValidUUID(id: unknown): id is UUID {
  if (typeof id !== 'string') return false;
  const uuidRegExp: RegExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return uuidRegExp.test(id);
}

function isValidParam(myObj: { name: unknown; value: unknown }): boolean {
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
    isValueValid = acceptedPrimitiveTypes || isValidArray(myObj.value);
  }
  return simpleChecks && isValueValid;
}

function isValidArray(array: unknown): boolean {
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

function validatePayload(payload: unknown): {
  messages: string[];
  validatedPayload: {
    queryId: UUID;
    params: {
      name: string;
      value: string | number | boolean | string[] | number[];
    }[];
  };
} {
  const messages: string[] = [];
  const validatedPayload: {
    queryId: UUID;
    params: {
      name: string;
      value: string | number | boolean | string[] | number[];
    }[];
  } = { queryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', params: [] };
  if (typeof payload !== 'object' || !payload) {
    messages.push('invalid payload');
  } else {
    Object.keys(payload)
      .filter((key) => !['queryId', 'params'].includes(key))
      .forEach((key) => messages.push(`unknown attribute: "${key}"`));

    if (!('queryId' in payload)) {
      messages.push('"queryId" is mandatory');
    } else if (!isValidUUID(payload.queryId)) {
      messages.push('"queryId" is not a valid UUID');
    } else {
      validatedPayload.queryId = payload.queryId;
    }

    if (!('params' in payload)) {
      messages.push('"params" is mandatory');
    } else if (!Array.isArray(payload.params)) {
      messages.push('"params" is not a valid array of params');
    } else {
      for (const item of payload.params) {
        if (!isValidParam(item)) {
          messages.push(`invalid item in "params": ${JSON.stringify(item)}`);
        } else {
          validatedPayload.params.push(item);
        }
      }
    }
  }

  return {
    messages,
    validatedPayload,
  };
}
