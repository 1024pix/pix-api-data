import { logger } from '../Logger.ts';
import { Server, Plugin } from '@hapi/hapi';
import { Logger } from 'pino';

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

    server.events.on('request', function (request, event): void {
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

      logger.info({
        method: request.method,
        path: request.path,
        queryParams: request.query,
        responseTime:
          (info.completed !== undefined ? info.completed : info.responded) -
          info.received,
        status: 'request completed',
      });
      logger.trace({
        req: request,
        res: request.raw.res,
      });
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
