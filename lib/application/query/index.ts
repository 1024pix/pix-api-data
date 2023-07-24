import { Server } from '@hapi/hapi';
import { execute } from './query.ts';

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
