import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery.js';
import { datamartRepository } from '../../../../lib/infrastructure/DatamartRepository.js';
import { expect } from '../../../test-helper.js';

describe('Integration | Repository | DatamartRepository', function () {
  describe('#find', function () {
    it('should execute given DatamartQueryModel', async function () {
      // given
      const datamartQuery = new DatamartQueryModel({ query: 'SELECT 1=1 as foo;', paramValues: [], paramDefinitions: [] });

      // when
      const { result: stream } = datamartRepository.find(datamartQuery);

      // then
      let result;
      for await (const chunk of stream) {
        result = chunk;
      }

      expect(result).to.deep.equal({ foo: true });
    });
  });
});
