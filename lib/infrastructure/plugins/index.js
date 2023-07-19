import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import * as pino from './pino.js';

const plugins = [Inert, Vision, pino];

export { plugins };
