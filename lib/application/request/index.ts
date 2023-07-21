import { Server } from '@hapi/hapi';
import { execute } from './request.ts';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/request',
      options: {
        handler: execute,
      },
    },
  ]);
};

const name = 'request-api';
export { register, name };
