import HapiSwagger from 'hapi-swagger';
import packageJson from '../../../package.json' with { type: 'json' };

const swaggerOptions: HapiSwagger.RegisterOptions = {
  OAS: 'v3.0',
  uiOptions: {
    url: '/openapi.json',
  },
  info: {
    title: 'API Data Documentation',
    version: packageJson.version,
  },
  securityDefinitions: {
    bearerAuth: {
      name: 'Authorization',
      scheme: 'Bearer',
      in: 'header',
      description: 'Example: Bearer eyJ...z',
      type: 'apiKey',
    },
  },
  security: [{ bearerAuth: [], jwt: [] }],
};

export const swaggerPlugin = {
  plugin: HapiSwagger,
  options: swaggerOptions,
};
