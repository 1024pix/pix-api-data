import type { Server } from '@hapi/hapi';
import Joi from 'joi';

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
            username: Joi.string().required(),
            password: Joi.string().required(),
          }).label('AuthenticationPayload'),
        },
        handler: authenticate,
        tags: ['api', 'authentication'],
      },
    },
  ]);
};

const name = 'authentication-api';
export { name, register };
