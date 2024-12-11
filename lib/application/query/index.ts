import type { Server } from '@hapi/hapi';
import Joi from 'joi';

import { SEED_PARAMETERS } from '../../common/db/seeds/seed.js';
import { execute } from './query.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/query',
      options: {
        validate: {
          payload: Joi.object({
            queryId: Joi.string().uuid().required().example(SEED_PARAMETERS.REF_ACADEMY_QUERY_ID),
            params: Joi.array()
              .items(
                Joi.object({
                  name: Joi.string().required().example(SEED_PARAMETERS.REF_ACADEMY_PARAM_NAME),
                  value: Joi.any().required().example([SEED_PARAMETERS.REF_ACADEMY_PARAM_VALUE]),
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
