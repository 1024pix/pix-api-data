import { expect } from 'chai';
import { createServer } from '../../lib/server.ts';
import { knexAPI } from '../../lib/common/db/knex-database-connections.js';

describe('Acceptance | query', function () {
  afterEach(async function () {
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
      });

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal({
        status: 'failure',
        data: [],
        messages: [
          'unknown attribute: "queryIdddddddd"',
          '"queryId" is mandatory',
        ],
      });
    });
  });

  context('when payload is valid', function () {
    context('when "requestId" refers to an existing query', function () {
      it('should return a proper payload response with status code 200', async function () {
        // given
        const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await knexAPI('catalog_queries').insert({
          id: queryId,
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
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(response.payload)).to.deep.equal({
          status: 'success',
          data: [[{ count: 33 }]],
          messages: [],
        });
      });
    });

    context(
      'when "requestId" does not refer to an existing query',
      function () {
        it('should return a proper error response with status code 422', async function () {
          // given
          const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
          const otherQueryId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
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
          });

          // then
          expect(response.statusCode).to.equal(422);
          expect(JSON.parse(response.payload)).to.deep.equal({
            status: 'failure',
            data: [],
            messages: ['cannot run requested query'],
          });
        });
      },
    );
  });
});
