import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

import * as pino from '../../common/logger/plugins/pino.js';
import { swaggerPlugin } from './swagger.js';

export const plugins = [Inert, Vision, pino, swaggerPlugin];
