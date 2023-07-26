import type { Server } from '@hapi/hapi';
import { execute } from './query.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/query',
      options: {
        handler: execute,
      },
    },
  ]);
};

const name = 'query-api';
export { register, name };
