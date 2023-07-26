// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chai from 'chai';
const expect = chai.expect;
import * as sinon from 'sinon';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import type { UUID } from 'crypto';
import { createServer } from '../lib/server';
import { knexAPI } from '../lib/common/db/knex-database-connections.js';
import { jsonWebTokenService } from '../lib/infrastructure/utils/JSONWebTokenService';

async function generateValidRequestAuthorizationHeader(
  userId: UUID,
): Promise<string> {
  const accessToken = await jsonWebTokenService.generateToken(userId);
  return `Bearer ${accessToken}`;
}

function catchErr(
  promiseFn: (...args: unknown[]) => Promise<unknown>,
  ctx: unknown = undefined,
) {
  return async (...args2: unknown[]) => {
    try {
      await promiseFn.call(ctx, ...args2);
    } catch (err: unknown) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

export {
  catchErr,
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  knexAPI,
  sinon,
};
