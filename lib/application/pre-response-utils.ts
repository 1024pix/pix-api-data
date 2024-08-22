import { DomainError } from '../domain/errors.js';
import * as errorManager from './error-manager.js';

function handleDomainAndHttpErrors(
  request,
  h,
) {
  const response = request.response;

  if (response instanceof DomainError) {
    return errorManager.handle(response);
  }

  return h.continue;
}

export { handleDomainAndHttpErrors };
