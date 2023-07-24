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
          it('with a datetime value', function () {
            // given
            const query: DatamartQueryModel = new DatamartQueryModel({
              query:
                'select * from table_exemple where dateTime = {{ mandatoryParam }}',
              paramValues: [
                {
                  name: 'mandatoryParam',
                  value: '2023-12-12 23:45:30',
                },
              ],
              paramDefinitions: [
                {
                  name: 'mandatoryParam',
                  type: ParamType.DATE_TIME,
                  mandatory: true,
                },
              ],
            });
            // then
            expect(query.isValid()).to.be.true;
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
    context('with date parameter', function () {
      it('should return true if value is a valid date according to ISO-8601 date format', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-07-21',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.true;
      });
      it('should return false if value is not a valid date', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-13-21',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.false;
      });
      it('should return false if value is a timestamp', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-12-21 13:13:13',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.false;
      });
    });
    context('with timestamp parameter', function () {
      it('should return true if value is a valid timestamp according to ISO-8601 timestamp format', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-07-21 12:12:12',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE_TIME,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.true;
      });
      it('should return false if value is not a valid timestamp', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-13-21 13:13:13',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE_TIME,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.false;
      });
      it('should return false if value is a date', function () {
        // given
        const query: DatamartQueryModel = new DatamartQueryModel({
          query: 'select * from table_exemple where date = {{ dateParam }}',
          paramValues: [
            {
              name: 'dateParam',
              value: '2013-12-21',
            },
          ],
          paramDefinitions: [
            {
              name: 'dateParam',
              type: ParamType.DATE_TIME,
              mandatory: false,
            },
          ],
        });
        // then
        expect(query.isValid()).to.be.false;
      });
    });
  });
});
