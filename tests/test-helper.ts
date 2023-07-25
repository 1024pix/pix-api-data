import { expect } from 'chai';
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
};
