import {
  expect,
  createServer,
  knexAPI,
  generateValidRequestAuthorizationHeader,
} from '../../test-helper.ts';

describe('Acceptance | query', function () {
  let headers: string;

  beforeEach(async function () {
    const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    await knexAPI('users').insert({
      id: userId,
      username: 'gigi_lamoroso',
      label: "Gigi l'amoroso",
      hashed_password: 'coucou',
    });
    headers = await generateValidRequestAuthorizationHeader(userId);
  });

  afterEach(async function () {
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
        status: 'failure',
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
            headers: { authorization: headers },
          });

          // then
          expect(response.statusCode).to.equal(422);
          expect(JSON.parse(response.payload)).to.deep.equal({
            status: 'failure',
            messages: ['cannot run requested query'],
          });
        });
      },
    );
  });
});
