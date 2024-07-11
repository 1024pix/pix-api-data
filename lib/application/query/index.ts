import type { Server } from '@hapi/hapi';
import Joi from 'joi';

import { execute } from './query.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/query',
      options: {
        validate: {
          payload: Joi.object({
            queryId: Joi.string().uuid().required(),
            params: Joi.array()
              .items(
                Joi.object({
                  name: Joi.string().required(),
                  value: Joi.any().required(),
                }).label('QueryParameter'),
              )
              .required()
              .label('QueryParameters'),
          }).label('QueryPayload'),
        },
        handler: execute,
        tags: ['api', 'query'],
      },
    },
  ]);
};

const name = 'query-api';
export { name, register };
