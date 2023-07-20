import { Server } from '@hapi/hapi';
import { executeQueryUseCase } from '../../domain/ExecuteQueryUsecase.ts';

const register = async function (server: Server) {
  server.route([
    {
      method: 'GET',
      path: '/',
      options: {
        handler: executeQueryUseCase.executeQuery,
      },
    },
  ]);
};

const name = 'request-api';
export { register, name };
