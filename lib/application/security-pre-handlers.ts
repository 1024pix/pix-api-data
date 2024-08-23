import * as checkIfUserIsBlockedUseCase from './usecases/checkIfUserIsBlocked.js';

async function checkIfUserIsBlocked(request, h) {
  const { username } = request.payload;
  await checkIfUserIsBlockedUseCase.execute(username);
  return h.response(true);
}

export {
  checkIfUserIsBlocked,
};
