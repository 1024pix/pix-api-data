import Hapi from '@hapi/hapi';
import { routes } from './lib/routes.js';
import { plugins } from './lib/infrastructure/plugins/index.js';

const createServer = async () => {
  const server = createBareServer();

  await setupRoutesAndPlugins(server);

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

const setupRoutesAndPlugins = async function (server) {
  const configuration = [].concat(plugins, routes);
  await server.register(configuration);
};

export { createServer };
