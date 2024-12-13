import type { Server } from '@hapi/hapi';
import Joi from 'joi';

import { SEED_PARAMETERS } from '../../common/db/seeds/seed.js';
import { checkIfUserIsBlocked } from '../security-pre-handlers.js';
import { authenticate } from './authentication.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/token',
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            username: Joi.string().required().example(SEED_PARAMETERS.REF_ACADEMY_USER),
            password: Joi.string().required().example(SEED_PARAMETERS.REF_ACADEMY_USER_PASSWORD),
          }).label('AuthenticationPayload'),
        },
        pre: [{ method: checkIfUserIsBlocked }],
        handler: authenticate,
        tags: ['api', 'authentication'],
      },
    },
  ]);
};

const name = 'authentication-api';
export { name, register };
