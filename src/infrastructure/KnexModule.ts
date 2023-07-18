import { KnexModule } from 'nest-knexjs';
import { DynamicModule } from '@nestjs/common';

export const knexImport: DynamicModule[] = [
  KnexModule.forRootAsync(
    {
      useFactory: () => ({
        config: {
          client: 'postgresql',
          version: '5.7',
          useNullAsDefault: true,
          connection: {
            host: '127.0.0.1',
            user: 'root',
            port: 3306,
            password: 'root',
            database: 'test1',
          },
          pool: {
            min: parseInt(
              process.env.DATABASE_DATAMART_CONNECTION_POOL_MIN_SIZE,
              10,
            ),
            max: parseInt(
              process.env.DATABASE_DATAMART_CONNECTION_POOL_MAX_SIZE,
              10,
            ),
          },
        },
      }),
    },
    'datamartConnection',
  ),
];
