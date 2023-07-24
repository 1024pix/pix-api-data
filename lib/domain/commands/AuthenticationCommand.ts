import { Result } from '../models/Result.ts';

export class AuthenticationCommand {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static buildFromPayload(payload: unknown): Result<AuthenticationCommand> {
    const { messages, validatedPayload } = validatePayload(payload);
    if (messages.length > 0) {
      return Result.failure(messages);
    }

    const userCommand = new AuthenticationCommand(
      validatedPayload.username,
      validatedPayload.password,
    );
    return Result.success(userCommand);
  }
}

function validatePayload(payload: unknown): {
  messages: string[];
  validatedPayload: {
    username: string;
    password: string;
  };
} {
  const messages: string[] = [];
  const validatedPayload: {
    username: string;
    password: string;
  } = { username: 'fill_me', password: 'fill_me' };
  if (typeof payload !== 'object' || !payload) {
    messages.push('invalid payload');
  } else {
    Object.keys(payload)
      .filter((key) => !['username', 'password'].includes(key))
      .forEach((key) => messages.push(`unknown attribute: "${key}"`));

    if (!('username' in payload)) {
      messages.push('"username" is mandatory');
    } else if (!isValidUsername(payload.username)) {
      messages.push('"username" is not a string');
    } else {
      validatedPayload.username = payload.username;
    }

    if (!('password' in payload)) {
      messages.push('"password" is mandatory');
    } else if (!isValidPassword(payload.password)) {
      messages.push('"password" is not a string');
    } else {
      validatedPayload.password = payload.password;
    }
  }

  return {
    messages,
    validatedPayload,
  };
}

function isValidUsername(username: unknown): username is string {
  return typeof username === 'string';
}

function isValidPassword(password: unknown): password is string {
  return typeof password === 'string';
}
