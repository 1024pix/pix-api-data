import { expect } from 'chai';
import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery.ts';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem.ts';

describe('Unit | DatamartQueryModel', function () {
  describe('isValid()', function () {
    it('should return true if mandatory parameter value is present', function () {
      // given
      const query: DatamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id = {{ mandatoryParam }}',
        paramValues: [
          {
            name: 'mandatoryParam',
            value: 'toto',
          },
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
    context(
      'should return false with invalid parameter value type',
      function () {
        context('when parameter is a string', function () {
          it('with an int value', function () {
            // given
            const query: DatamartQueryModel = new DatamartQueryModel({
              query:
                'select * from table_exemple where id = {{ mandatoryParam }}',
              paramValues: [
                {
                  name: 'mandatoryParam',
                  value: 1,
                },
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
            expect(query.isValid()).to.be.false;
          });
          it('with a boolean value', function () {
            // given
            const query: DatamartQueryModel = new DatamartQueryModel({
              query:
                'select * from table_exemple where id = {{ mandatoryParam }}',
              paramValues: [
                {
                  name: 'mandatoryParam',
                  value: true,
                },
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
            expect(query.isValid()).to.be.false;
          });
        });
        context('when parameter is an int', function () {
          it('with a string value', function () {
            // given
            const query: DatamartQueryModel = new DatamartQueryModel({
              query:
                'select * from table_exemple where id = {{ mandatoryParam }}',
              paramValues: [
                {
                  name: 'mandatoryParam',
                  value: '12',
                },
              ],
              paramDefinitions: [
                {
                  name: 'mandatoryParam',
                  type: ParamType.INT,
                  mandatory: true,
                },
              ],
            });
            // then
            expect(query.isValid()).to.be.false;
          });
        });
      },
    );
  });
});
