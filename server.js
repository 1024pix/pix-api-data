import Hapi from '@hapi/hapi';
import { routes } from './lib/routes.js';

const createServer = async () => {
  const server = createBareServer();

  await server.register(routes);

  return server;
};

const createBareServer = function () {
  const serverConfiguration = {
    compression: false,
    debug: { request: false, log: false },
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With'],
      },
      response: {
        emptyStatusCode: 204,
      },
    },
    port: process.env.PORT || 3000,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  return new Hapi.server(serverConfiguration);
};

export { createServer };
