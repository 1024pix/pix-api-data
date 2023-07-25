import { Request, ResponseToolkit } from '@hapi/hapi';
import boom from '@hapi/boom';
import { jsonWebTokenService } from './utils/JSONWebTokenService.ts';
import { UUID } from 'crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';

async function _checkIsAuthenticated(
  request: Request,
  h: ResponseToolkit,
  { validate }: { validate: Function },
) {
  const accessToken = jsonWebTokenService.extractTokenFromHeader(request);
  if (!accessToken) {
    return boom.unauthorized('Invalid token');
  }

  const decodedAccessToken = jsonWebTokenService.getDecodedToken(accessToken);
  if (!decodedAccessToken) {
    return boom.unauthorized('Invalid token');
  }

  const userExists = await validate(decodedAccessToken.user_id);
  if (!userExists) {
    return boom.unauthorized('Invalid token');
  }

  return h.authenticated({
    credentials: { userId: decodedAccessToken.user_id },
  });
}

async function checkUserExists(userId: UUID): Promise<boolean> {
  const userDTO = await knexAPI('users')
    .select('id')
    .where('id', userId)
    .first();

  return !!userDTO;
}

const authentication = {
  schemeName: 'jwt-scheme',

  scheme(_: unknown, { validate }: { validate: Function }) {
    return {
      authenticate: (request: Request, h: ResponseToolkit) =>
        _checkIsAuthenticated(request, h, { validate }),
    };
  },
  strategies: [
    {
      name: 'jwt',
      configuration: {
        validate: checkUserExists,
      },
    },
  ],
  defaultStrategy: 'jwt',
};

export { authentication };
