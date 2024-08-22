import { env } from 'node:process';
import type { Server, ServerOptions } from '@hapi/hapi';
import Hapi from '@hapi/hapi';

import { authentication } from './infrastructure/authentication.js';
import { plugins } from './infrastructure/plugins/plugins.js';
import { routes } from './routes.js';

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
    port: env.PORT || 3000,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  return Hapi.server(serverConfiguration);
};

const setupAuthentication = function (server: Server) {
  server.auth.scheme(authentication.schemeName, authentication.scheme);
  authentication.strategies.forEach((strategy) => {
    server.auth.strategy(
      strategy.name,
      authentication.schemeName,
      strategy.configuration,
    );
  });
  server.auth.default(authentication.defaultStrategy);
};

const setupRoutesAndPlugins = async function (server: Server) {
  const configuration = [].concat(plugins, routes);
  await server.register(configuration);
};

async function createServer(): Promise<Server> {
  const server = createBareServer();
  setupAuthentication(server);
  await setupRoutesAndPlugins(server);
  return server;
}

export { createServer };
