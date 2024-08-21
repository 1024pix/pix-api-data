import type { UUID } from 'node:crypto';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createServer } from '../lib/server';
import { knexAPI } from '../lib/common/db/knex-database-connections.js';
import { jsonWebTokenService } from '../lib/infrastructure/utils/JSONWebTokenService';

const expect = chai.expect;
chai.use(sinonChai);

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
    }
    catch (err: unknown) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(function () {
  sinon.restore();
});

// eslint-disable-next-line mocha/no-exports
export {
  catchErr,
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  knexAPI,
  sinon,
};
