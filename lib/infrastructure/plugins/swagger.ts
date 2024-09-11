import HapiSwagger from 'hapi-swagger';

import packageJson from '../../../package.json' with { type: 'json' };

export const swaggerPlugin = {
  plugin: HapiSwagger,
  options: {
    info: {
      title: 'API Data Documentation',
      version: packageJson.version,
    },
    securityDefinitions: {
      Bearer: {
        'type': 'apiKey',
        'name': 'Authorization',
        'in': 'header',
        'x-keyPrefix': 'Bearer ',
      },
    },
    security: [{ Bearer: [] }],
  },
};
