import type { UUID } from 'node:crypto';
import {
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  knexAPI,
} from '../../test-helper.js';

describe('Acceptance | query', function () {
  let headers: string;
  let userId: UUID;

  beforeEach(async function () {
    userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    await knexAPI('users').insert({
      id: userId,
      username: 'gigi_lamoroso',
      label: 'Gigi l\'amoroso',
      hashed_password: 'coucou',
    });
    headers = await generateValidRequestAuthorizationHeader(userId);
  });

  afterEach(async function () {
    await knexAPI('query_access').delete();
    await knexAPI('user-logins').delete();
    await knexAPI('users').delete();
    await knexAPI('catalog_queries').delete();
  });

  context('when payload is invalid', function () {
    it('should return a proper error response with status code 400', async function () {
      // given
      const payload = {
        queryIdddddddd: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        params: <any>[],
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/query',
        payload,
        headers: { authorization: headers },
      });

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid request payload input',
      });
    });
  });

  context('when payload is valid', function () {
    context('when "queryId" refers to an existing query', function () {
      context('when user is not authorized to run the query', function () {
        it('should return a proper error with status code 403', async function () {
          // given
          const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
          await knexAPI('catalog_queries').insert({
            id: queryId,
            sql_query: 'SELECT COUNT(*) FROM public.data_ref_academies UNION SELECT 1;',
          });
          await knexAPI('query_access').insert({
            query_id: queryId,
            user_id: userId,
          });
          const payload = {
            queryId,
            params: <any>[],
          };

          // when
          const server = await createServer();
          const response = await server.inject({
            method: 'POST',
            url: '/query',
            payload,
            headers: { authorization: headers },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.payload)).to.deep.equal({
            status: 'success',
            data: [{ count: 1 }, { count: 33 }],
            messages: [],
          });
        });
      });

      context('when user is authorized to run the query', function () {
        it('should return a proper payload response with status code 200', async function () {
          // given
          const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';
          await knexAPI('catalog_queries').insert({
            id: queryId,
            sql_query: 'SELECT COUNT(*) FROM public.data_ref_academies',
          });
          await knexAPI('query_access').insert({
            query_id: queryId,
            user_id: userId,
          });
          const payload = {
            queryId,
            params: <any>[],
          };

          // when
          const server = await createServer();
          const response = await server.inject({
            method: 'POST',
            url: '/query',
            payload,
            headers: { authorization: headers },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.payload)).to.deep.equal({
            status: 'success',
            data: [{ count: 33 }],
            messages: [],
          });
        });
      });
    });

    context('when "queryId" does not refer to an existing query', function () {
      it('should return a proper error response with status code 422', async function () {
        // given
        const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';
        const otherQueryId = '11a1aaaa-aa11-1a11-a1aa-1aaaaa1111aa';
        await knexAPI('catalog_queries').insert({
          id: otherQueryId,
          sql_query: 'SELECT COUNT(*) FROM public.data_ref_academies',
        });
        const payload = {
          queryId,
          params: <any>[],
        };

        // when
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/query',
          payload,
          headers: { authorization: headers },
        });

        // then
        expect(response.statusCode).to.equal(422);
        expect(JSON.parse(response.payload)).to.deep.equal({
          status: 'failure',
          messages: ['cannot run requested query'],
        });
      });
    });
  });
});
