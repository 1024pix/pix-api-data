import type { UUID } from 'node:crypto';
import type { UserCommandParam } from '../../../lib/domain/commands/UserCommand.js';
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
    await knexAPI('query_param_access').delete();
    await knexAPI('catalog_query_params').delete();
    await knexAPI('users').delete();
    await knexAPI('catalog_queries').delete();
  });

  context('when payload is invalid', function () {
    it('should return a proper error response with status code 400', async function () {
      // given
      const payload = {
        queryIdddddddd: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        params: <UserCommandParam[]>[],
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
            name: 'foo',
          });
          await knexAPI('query_access').insert({
            query_id: queryId,
            user_id: userId,
          });
          const payload = {
            queryId,
            params: <UserCommandParam[]>[],
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
            name: 'foo',
          });
          await knexAPI('query_access').insert({
            query_id: queryId,
            user_id: userId,
          });
          const payload = {
            queryId,
            params: <UserCommandParam[]>[],
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

        context('when user uses params', function () {
          context('when user does not have access to param', function () {
            it('should return a proper error with status code 422', async function () {
              // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';
              const otherUserId = '26f6efcc-ce13-4b20-b6ea-5bebae6115ae';

              await knexAPI('users').insert({
                id: otherUserId,
                username: 'gigi_lamorosa',
                label: 'Gigi l\'amorosa',
                hashed_password: 'coucou',
              });

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where nom = {{ academie }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'acamdemie',
                type: 'string',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: otherUserId,
                query_param_id: 1,
                value: 'Bordeaux',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academie', value: 'Paris' }],
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
                messages: ['No access to requested params'],
              });
            });
          });
          context('when user has access to param', function () {
            it('should return a proper payload response with status code 200', async function () {
            // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where nom = {{ academie }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'academie',
                type: 'string',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: userId,
                query_param_id: 1,
                value: 'Bordeaux',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academie', value: 'Bordeaux' }],
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
                data: [{ count: 1 }],
                messages: [],
              });
            });
          });
          context('when user does not have access to value', function () {
            it('should return a proper error with status code 422', async function () {
              // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where nom = {{ academie }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'academie',
                type: 'string',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: userId,
                query_param_id: 1,
                value: 'Bordeaux',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academie', value: 'Paris' }],
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
                messages: ['No access to requested params'],
              });
            });
          });

          context('when user does not have access to wildcard', function () {
            it('should return a proper error with status code 422', async function () {
              // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where nom = {{ academie }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'academie',
                type: 'string',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: userId,
                query_param_id: 1,
                value: 'Bordeaux',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academie', value: 'Paris' }],
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
                messages: ['No access to requested params'],
              });
            });
          });

          context('when user has access to wildcard', function () {
            it('should return a proper payload response with status code 200 when catalog_params is string', async function () {
              // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where nom = {{ academie }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'academie',
                type: 'string',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: userId,
                query_param_id: 1,
                value: 'any',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academie', value: 'Bordeaux' }],
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
                data: [{ count: 1 }],
                messages: [],
              });
            });

            it('should return a proper payload response with status code 200 when catalog_params is int', async function () {
              // given
              const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

              await knexAPI('catalog_queries').insert({
                id: queryId,
                sql_query: `SELECT COUNT(*) as count FROM public.data_ref_academies where id = {{ academieId }}`,
                name: 'foo',
              });
              await knexAPI('query_access').insert({
                query_id: queryId,
                user_id: userId,
              });
              await knexAPI('catalog_query_params').insert({
                id: 1,
                catalog_query_id: queryId,
                name: 'academieId',
                type: 'int',
                mandatory: true,
              });
              await knexAPI('query_param_access').insert({
                id: queryId,
                user_id: userId,
                query_param_id: 1,
                value: 'any',
              });

              const payload = {
                queryId,
                params: <UserCommandParam[]>[{ name: 'academieId', value: 1 }],
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
                data: [{ count: 1 }],
                messages: [],
              });
            });
          });
        });
        context('when user request response in csv', function () {
          it('should return a csv response with status code 200', async function () {
            // given
            const queryId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';
            await knexAPI('catalog_queries').insert({
              id: queryId,
              sql_query: `SELECT COUNT(*) as count, 'A' as value FROM public.data_ref_academies UNION SELECT 10, 'B'`,
              name: 'foo',
            });
            await knexAPI('query_access').insert({
              query_id: queryId,
              user_id: userId,
            });
            const payload = {
              queryId,
              params: <UserCommandParam[]>[],
            };

            // when
            const server = await createServer();
            const response = await server.inject({
              method: 'POST',
              url: '/query',
              payload,
              headers: { authorization: headers, accept: 'text/csv' },
            });

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.payload).to.deep.equal('"count","value"\n10,"B"\n33,"A"');
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
          name: 'foo',
        });
        const payload = {
          queryId,
          params: <UserCommandParam[]>[],
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
