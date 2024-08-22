export class DomainError extends Error {
  code: string;
  meta: string;
  constructor(message, code?, meta?) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export class NotFoundError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export class UserIsTemporaryBlocked extends DomainError {
  constructor(message = 'User has been temporary blocked.', code = 'USER_HAS_BEEN_TEMPORARY_BLOCKED') {
    super(message, code);
  }
}
