import { UserIsTemporaryBlocked } from '../../domain/errors.js';
import { userLoginRepository } from '../../infrastructure/UserLoginRepository.js';

async function execute(username) {
  const foundUserLogin = await userLoginRepository.findByUsername(username);
  if (foundUserLogin?.isUserMarkedAsTemporaryBlocked()) {
    throw new UserIsTemporaryBlocked();
  }
}

export { execute };
