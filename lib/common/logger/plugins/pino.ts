import { logger } from '../Logger.js';
import type { Plugin, Server } from '@hapi/hapi';
import type { Logger } from 'pino';

const plugin: Plugin<unknown> = {
  name: 'hapi-pino',
  register: async (server: Server, options: Options): Promise<void> => {
    const logger = options.instance;

    server.ext('onPostStart', async function (): Promise<any> {
      logger.info(server.info, 'server started');
    });

    server.ext('onPostStop', async function (): Promise<void> {
      logger.info(server.info, 'server stopped');
    });

    server.events.on('log', function (event): void {
      logger.info({ tags: event.tags, data: event.data });
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    server.events.on('request', (request, event): void => {
      if (event.channel !== 'error') {
        return;
      }
      if (event.error) {
        logger.error(
          {
            tags: event.tags,
            err: event.error,
          },
          'request error',
        );
      }
    });

    server.events.on('response', (request): void => {
      const info = request.info;

      logger.info(
        {
          queryParams: request.query,
          responseTime:
            (info.completed !== undefined ? info.completed : info.responded) -
            info.received,
          payload: request.auth.isAuthenticated ? request.payload : {},
          req: request,
          res: request.raw.res,
        },
        'request completed',
      );
    });
  },
};

type Options = {
  instance: Logger;
};
const options: Options = {
  instance: logger,
};

export { plugin, options };
