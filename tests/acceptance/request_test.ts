import { expect } from 'chai';
import { createServer } from '../../lib/server.ts';
import { knexAPI } from '../../lib/common/db/knex-database-connections.js';

describe('Acceptance | request', function () {
  afterEach(async function () {
    await knexAPI('catalog_requests').delete();
  });

  context('when payload is invalid', function () {
    it('should return a proper error response with status code 400', async function () {
      // given
      const payload = {
        requestIdddddd: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        params: <any>[],
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/request',
        payload,
      });

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal({
        status: 'failure',
        data: [],
        messages: [
          'unknown attribute: "requestIdddddd"',
          '"requestId" is mandatory',
        ],
      });
    });
  });

  context('when payload is valid', function () {
    context('when "requestId" refers to an existing request', function () {
      it('should return a proper payload response with status code 200', async function () {
        // given
        const requestId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await knexAPI('catalog_requests').insert({
          id: requestId,
          request: 'SELECT COUNT(*) FROM public.data_ref_academies',
        });
        const payload = {
          requestId,
          params: <any>[],
        };

        // when
        const server = await createServer();
        const response = await server.inject({
          method: 'POST',
          url: '/request',
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
      'when "requestId" does not refer to an existing request',
      function () {
        it('should return a proper error response with status code 422', async function () {
          // given
          const requestId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
          const otherRequestId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
          await knexAPI('catalog_requests').insert({
            id: otherRequestId,
            request: 'SELECT COUNT(*) FROM public.data_ref_academies',
          });
          const payload = {
            requestId,
            params: <any>[],
          };

          // when
          const server = await createServer();
          const response = await server.inject({
            method: 'POST',
            url: '/request',
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
