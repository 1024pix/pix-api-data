import { routes } from './routes.ts';
import Hapi, { Server, ServerOptions } from '@hapi/hapi';
import { plugins } from './common/logger/plugins/plugins.ts';

const createServer = async (): Promise<Server> => {
  const server = createBareServer();
  await setupRoutesAndPlugins(server);
  return server;
};

const createBareServer = function (): Server {
  const serverConfiguration: ServerOptions = {
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

  return Hapi.server(serverConfiguration);
};

const setupRoutesAndPlugins = async function (server: Server) {
  const configuration = [].concat(plugins, routes);
  await server.register(configuration);
};

export { createServer };
