import type { Server } from '@hapi/hapi';
import { authenticate } from './authentication.js';

const register = async function (server: Server) {
  server.route([
    {
      method: 'POST',
      path: '/token',
      options: {
        auth: false,
        handler: authenticate,
      },
    },
  ]);
};

const name = 'authentication-api';
export { register, name };
