import type { Readable } from 'node:stream';

export interface DatamartResponse {
  result: Readable;
}
