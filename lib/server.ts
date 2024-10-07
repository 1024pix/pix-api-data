import type { Server, ServerOptions } from '@hapi/hapi';
import { env } from 'node:process';
import Oppsy from '@1024pix/oppsy';

import Hapi from '@hapi/hapi';
import { handleDomainAndHttpErrors } from './application/pre-response-utils.js';
import { config } from './common/config.js';
import { knexAPI, knexDatamart } from './common/db/knex-database-connections.js';
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

const setupErrorHandling = function (server: Server) {
  server.ext('onPreResponse', handleDomainAndHttpErrors);
};

const enableOpsMetrics = function (server) {
  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    const apiKnexPool = knexAPI.client.pool;
    const datamartKnexPool = knexDatamart.client.pool;
    server.log(['ops'], {
      ...data,
      knexPool: {
        apiData: {
          used: apiKnexPool.numUsed(),
          free: apiKnexPool.numFree(),
          pendingAcquires: apiKnexPool.numPendingAcquires(),
          pendingCreates: apiKnexPool.numPendingCreates(),
        },
        datamart: {
          used: datamartKnexPool.numUsed(),
          free: datamartKnexPool.numFree(),
          pendingAcquires: datamartKnexPool.numPendingAcquires(),
          pendingCreates: datamartKnexPool.numPendingCreates(),
        },
      },
    });
  });

  oppsy.start(config.logging.opsEventIntervalInSeconds * 1000);
  server.oppsy = oppsy;
};

async function createServer(): Promise<Server> {
  const server = createBareServer();
  setupErrorHandling(server);
  setupAuthentication(server);
  await setupRoutesAndPlugins(server);
  enableOpsMetrics(server);
  return server;
}

export { createServer };
