import { expect } from '../../../test-helper.js';
import { UserCommandParam } from '../../../../lib/domain/commands/UserCommandParam.js';
import { ParamType, QueryParam } from '../../../../lib/domain/models/QueryCatalogItem.js';
import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery';

describe('Unit | Domain | UserCommandParam', function () {
  context(
    'should return true with valid parameter value type',
    function () {
      context('when parameter is a string', function () {
        it('with an int value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', 1);
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.INT,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
        });
        it('with a boolean value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', true);
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.BOOLEAN,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
        });
        it('with a datetime value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', '2023-12-12 23:45:30');
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.DATE_TIME,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
        });
      });
      context('when parameter is an int', function () {
        it('with a string value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', '12');
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.STRING,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
        });
      });
    },
  );
  context('with date parameter', function () {
    it('should return true if value is a valid date according to ISO-8601 date format', function() {
      // given
      const userCommandParam = new UserCommandParam('dateParam', '2013-07-21');
      const paramDefinitions: QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
    });
    it('should return false if value is not a valid date', function() {
      // given
      const userCommandParam = new UserCommandParam('dateParam', '2013-13-21');
      const paramDefinitions: QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
    });
  });
  context('with datetime parameter', function () {
    it('should return false if value is a timestamp', function () {
      // given
      const userCommandParam = new UserCommandParam('dateParam', '2013-12-21 13:13:13');
      const paramDefinitions : QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
    });
    it('should return true if value is a valid timestamp according to ISO-8601 timestamp format', function () {
      // given
      const userCommandParam = new UserCommandParam('dateParam', '2013-07-21 12:12:12');
      const paramDefinitions : QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE_TIME,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.true;
    });
    it('should return false if value is not a valid timestamp', function () {
      // given
      const userCommandParam =new UserCommandParam('dateParam', '2013-13-21 13:13:13');
      const paramDefinitions : QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE_TIME,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
    });
    it('should return false if value is a date', function () {
      // given
      const userCommandParam =new UserCommandParam('dateParam', '2013-12-21');
      const paramDefinitions : QueryParam = {
        name: 'dateParam',
        type: ParamType.DATE_TIME,
        mandatory: false,
      };
      // then
      expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
    });
  });
  context(
    'should return false with invalid parameter value type',
    function () {
      context('when parameter is a string', function () {
        it('with an int value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', 1);
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.STRING,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
        });
        it('with a boolean value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', true);
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.STRING,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
        });
        it('with a datetime value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', '2023-12-12 23:45:30');
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.DATE,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
        });
      });
      context('when parameter is an int', function () {
        it('with a string value', function () {
          // given
          const userCommandParam = new UserCommandParam('mandatoryParam', '12');
          const paramDefinitions : QueryParam = {
            name: 'mandatoryParam',
            type: ParamType.INT,
            mandatory: true,
          };
          // then
          expect(userCommandParam.isValid([paramDefinitions])).to.be.false;
        });
      });
    },
  );
});
