import { expect, createServer, knexAPI } from '../test-helper.ts';
import { encryptionService } from '../../lib/infrastructure/utils/EncryptionService.ts';

describe('Acceptance | authentication', function () {
  afterEach(async function () {
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
        status: 'failure',
        data: [],
        messages: [
          'unknown attribute: "usernameeeeeeeeuh"',
          '"username" is mandatory',
        ],
      });
    });
  });

  context('when payload is valid', function () {
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
          label: "Gigi l'amoroso",
          password: hashedPassword,
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
        expect(typeof parsedResponse.data[0]).to.equal('string');
      });
    });

    context('when "username" does not refer to an existing user', function () {
      it('should return a proper error response with status code 422', async function () {
        // given
        const rawPassword = 'un_super_mdp';
        const hashedPassword = await encryptionService.hashPassword(
          'un_super_mdp',
        );
        await knexAPI('users').insert({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          username: 'gigi_lamoroso',
          label: "Gigi l'amoroso",
          password: hashedPassword,
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
        expect(response.statusCode).to.equal(422);
        expect(JSON.parse(response.payload)).to.deep.equal({
          status: 'failure',
          data: [],
          messages: ['cannot authenticate user'],
        });
      });
    });
  });
});
