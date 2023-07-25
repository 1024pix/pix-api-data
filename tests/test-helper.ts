import chai from 'chai';
const expect = chai.expect;
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import { UUID } from 'crypto';
import { createServer } from '../lib/server.ts';
import { knexAPI } from '../lib/common/db/knex-database-connections.js';
import { jsonWebTokenService } from '../lib/infrastructure/utils/JSONWebTokenService.ts';

async function generateValidRequestAuthorizationHeader(
  userId: UUID,
): Promise<string> {
  const accessToken = await jsonWebTokenService.generateToken(userId);
  return `Bearer ${accessToken}`;
}

export {
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  knexAPI,
  sinon,
};
