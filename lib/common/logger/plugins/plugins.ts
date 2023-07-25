import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import * as pino from './pino.ts';

export const plugins = [Inert, Vision, pino];
