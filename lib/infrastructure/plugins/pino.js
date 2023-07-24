import { logger } from '../../common/logger/logger.js';

const plugin = {
  name: 'hapi-pino',
  register: async function (server, options) {
    const logger = options.instance;

    server.ext('onPostStart', async function () {
      logger.info(server.info, 'server started');
    });

    server.ext('onPostStop', async function () {
      logger.info(server.info, 'server stopped');
    });

    server.events.on('log', function (event) {
      logger.info({ tags: event.tags, data: event.data });
    });

    server.events.on('request', function (request, event) {
      if (event.channel !== 'error') {
        return;
      }
      if (event.error) {
        logger.error(
          {
            tags: event.tags,
            err: event.error,
          },
          'query error',
        );
      }
    });

    server.events.on('response', (request) => {
      const info = request.info;
      logger.info(
        {
          queryParams: request.query,
          req: request,
          res: request.raw.res,
          responseTime:
            (info.completed !== undefined ? info.completed : info.responded) -
            info.received,
        },
        'query completed',
      );
    });
  },
};

const options = {
  instance: logger,
};

export { plugin, options };
