import boom from '@hapi/boom';
import { UserIsTemporaryBlocked } from '../domain/errors';

function _mapToHttpError(error) {
  switch (error.constructor) {
    case UserIsTemporaryBlocked:
      return boom.forbidden(error.message);
    default:
      return boom.internal(error.message);
  }
}

function handle(error) {
  return _mapToHttpError(error);
}

export { handle };
