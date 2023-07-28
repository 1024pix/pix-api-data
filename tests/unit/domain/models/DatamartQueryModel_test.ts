import { expect } from 'chai';
import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery.js';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem.js';
import { UserCommandParam } from '../../../../lib/domain/models/UserCommandParam.js';

describe('Unit | DatamartQueryModel', function () {
  describe('isValid()', function () {
    it('should return true if mandatory parameter value is present', function () {
      // given
      const query: DatamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id = {{ mandatoryParam }}',
        paramValues: [
          new UserCommandParam('mandatoryParam', 'toto')
        ],
        paramDefinitions: [
          {
            name: 'mandatoryParam',
            type: ParamType.STRING,
            mandatory: true,
          },
        ],
      });
      // then
      expect(query.isValid()).to.be.true;
    });
    it('should return false if mandatory parameter value is missing', function () {
      // given
      const query: DatamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple id = {{ mandatoryParam }}',
        paramValues: [],
        paramDefinitions: [
          {
            name: 'mandatoryParam',
            type: ParamType.STRING,
            mandatory: true,
          },
        ],
      });
      // then
      expect(query.isValid()).to.be.false;
    });
    it('should return true if optional parameter value is missing', function () {
      // given
      const query: DatamartQueryModel = new DatamartQueryModel({
        query:
          'select * from table_exemple where 1 = 1 [[id = {{ optionalParam }}]]',
        paramValues: [],
        paramDefinitions: [
          {
            name: 'optionalParam',
            type: ParamType.STRING,
            mandatory: false,
          },
        ],
      });
      // then
      expect(query.isValid()).to.be.true;
    });
  });
});
