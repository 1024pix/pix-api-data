import { Server } from '@hapi/hapi';
import { executeDefaultQuery } from '../../domain/execute-query-usecase.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'GET',
      path: '/',
      options: {
        handler: executeDefaultQuery,
      },
    },
  ]);
};

const name = 'request-api';
export { register, name };
