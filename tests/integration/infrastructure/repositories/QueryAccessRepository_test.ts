import { expect, knexAPI } from '../../../test-helper.js';
import { queryAccessRepository } from '../../../../lib/infrastructure/QueryAccessRepository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { QueryAccessModel } from '../../../../lib/domain/models/QueryAccess';

describe('Integration | Repositories | QueryAccessRepository', function () {

  afterEach(async function () {
    await knexAPI('query_param_access').delete();
    await knexAPI('query_access').delete();
    await knexAPI('users').delete();
    await knexAPI('catalog_query_params').delete();
    await knexAPI('catalog_queries').delete();
  });

  context('when query access does not exist', function () {
    it('should throw an error', async function () {
      // given
      const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const userId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

      // when
      let error;
      try {
        await queryAccessRepository.get(queryId, userId);
      } catch (e) {
        error = e;
      }

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
      expect(error.message).to.equal('Query access not found');
    });
  });

  context('when query access exists', function () {
    it('should return the query access', async function() {
      // given
      const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const queryParamId = 1;
      const userId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';

      await knexAPI('catalog_queries').insert({
        id: queryId,
        sql_query: 'SELECT * FROM public.data_ref_academies LIMIT {{ limit}}',
      });
      await knexAPI('catalog_query_params').insert({
        id: queryParamId,
        catalog_query_id: queryId,
        name: 'limit',
        type: 'int',
        mandatory: true,
      });

      await knexAPI('users').insert({
        id: userId,
        username: 'foo',
        label: 'bar',
        hashed_password: 'hashedPassword',
      });

      await knexAPI('query_access').insert({
        query_id: queryId,
        user_id: userId,
      });
      await knexAPI('query_param_access').insert({
        query_param_id: queryParamId,
        user_id: userId,
        value: '10',
      });
      await knexAPI('query_param_access').insert({
        query_param_id: queryParamId,
        user_id: userId,
        value: '20',
      });

      // when
      const queryAccess = await queryAccessRepository.get(queryId, userId);

      // then
      expect(queryAccess).to.instanceOf(QueryAccessModel);
      expect(queryAccess.paramsAccess).to.deep.equal({
        limit: ['10', '20'],
      });
    });
  });
});