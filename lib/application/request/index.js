import {executeDefaultQuery} from '../../domain/execute-query-usecase.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/',
      config: {
        handler: executeDefaultQuery,
      },
    },
  ]);
};

const name = 'request-api';
export { register, name };
