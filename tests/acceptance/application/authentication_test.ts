import { config } from '../../../lib/common/config.js';
import { encryptionService } from '../../../lib/infrastructure/utils/EncryptionService.js';
import { createServer, expect, knexAPI, sinon } from '../../test-helper.js';

describe('Acceptance | authentication', function () {
  afterEach(async function () {
    await knexAPI('user-logins').delete();
    await knexAPI('users').delete();
  });

  context('when payload is invalid', function () {
    it('should return a proper error response with status code 400', async function () {
      // given
      const payload = {
        usernameeeeeeeeuh: 'lolo_la_fripouille',
        password: 'LesFruitsC_cool',
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/token',
        payload,
      });

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal({
        error: 'Bad Request',
        message: 'Invalid request payload input',
        statusCode: 400,
      });
    });
  });

  context('when payload is valid', function () {
    context('when "username" does not refer to an existing user', function () {
      it('should return a proper error response with status code 401', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          rawPassword,
        );
        await knexAPI('users').insert({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        const payload = {
          username: 'dalida',
          password: rawPassword,
        };

        // when
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(401);
        expect(JSON.parse(response.payload)).to.deep.equal({
          status: 'failure',
          messages: ['cannot authenticate user'],
        });
      });
    });
    context('when "password" is wrong', function () {
      it('should return a proper error response with status code 401', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          rawPassword,
        );
        await knexAPI('users').insert({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        const payload = {
          username: 'gigi_lamoroso',
          password: 'un_mdp_different',
        };

        // when
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(401);
        expect(JSON.parse(response.payload)).to.deep.equal({
          status: 'failure',
          messages: ['cannot authenticate user'],
        });
      });
    });
    context('when "username" and "password" are matching', function () {
      it('should return a proper payload response with status code 200', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          'un_super_mdp',
        );
        await knexAPI('users').insert({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        const payload = {
          username: 'gigi_lamoroso',
          password: rawPassword,
        };

        // when
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        const parsedResponse = JSON.parse(response.payload);
        expect(response.statusCode).to.equal(200);
        expect(parsedResponse.status).to.equal('success');
        expect(parsedResponse.messages).to.deep.equal([]);
        sinon.assert.match(parsedResponse.data, {
          access_token: sinon.match.string,
          token_type: 'Bearer',
          expires_in: config.authentication.accessTokenLifespan,
        });
      });
    });
  });

  context('User blocking', function () {
    context('when user fails to authenticate for the threshold failure count', function () {
      it('replies an unauthorized error and blocks the user for the blocking time', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          rawPassword,
        );
        const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await knexAPI('users').insert({
          id: userId,
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        await knexAPI('user-logins').insert({ userId, failureCount: 9 });

        const payload = {
          username: 'gigi_lamoroso',
          password: 'bad-password',
        };
        const server = await createServer();

        // when
        const { statusCode } = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        expect(statusCode).to.equal(401);
        const userLogin = await knexAPI('user-logins').where({ userId }).first();
        expect(userLogin.failureCount).to.equal(10);
        expect(userLogin.temporaryBlockedUntil).to.exist;
      });
    });

    context('when user successfully authenticate but still blocked', function () {
      it('replies a forbidden error and keep on blocking the user for the blocking time', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          rawPassword,
        );
        const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await knexAPI('users').insert({
          id: userId,
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        await knexAPI('user-logins').insert({ userId, failureCount: 10, temporaryBlockedUntil: new Date(Date.now() + 3600 * 1000) });

        const payload = {
          username: 'gigi_lamoroso',
          password: rawPassword,
        };
        const server = await createServer();

        // when
        const { statusCode } = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });

    context('when user successfully authenticate after being blocked', function () {
      it('resets the failure count and the temporary blocked until date', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          rawPassword,
        );
        const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await knexAPI('users').insert({
          id: userId,
          username: 'gigi_lamoroso',
          label: 'Gigi l\'amoroso',
          hashed_password: hashedPassword,
        });
        await knexAPI('user-logins').insert({ userId, failureCount: 10, temporaryBlockedUntil: new Date('2023-10-10') });

        const payload = {
          username: 'gigi_lamoroso',
          password: rawPassword,
        };
        const server = await createServer();

        // when
        const { statusCode } = await server.inject({
          method: 'POST',
          url: '/token',
          payload,
        });

        // then
        expect(statusCode).to.equal(200);
        const userLogin = await knexAPI('user-logins').where({ userId }).first();
        expect(userLogin.failureCount).to.equal(0);
        expect(userLogin.temporaryBlockedUntil).to.be.null;
      });
    });
  });
});
