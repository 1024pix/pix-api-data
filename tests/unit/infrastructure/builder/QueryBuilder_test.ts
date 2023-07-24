/* eslint-disable */
import { expect } from 'chai';
import { QueryBuilder } from '../../../../lib/infrastructure/builder/QueryBuilder.ts';
import { DatamartQuery } from '../../../../lib/domain/models/DatamartQuery.ts';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem.js';

describe('Unit | Query builder', function () {
  describe('query without optional block definition', function () {
    it('simple query without param', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query: 'select * from table_exemple\nwhere id = 1',
        paramValues: [],
        paramDefinitions: [],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal('select * from table_exemple where id = 1');
    });
    it('simple query with mandatory param', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query: 'select * from table_exemple where id = {{ injectString }}',
        paramValues: [
          {
            value: 'valeur à injecter',
            name: 'injectString',
          },
        ],
        paramDefinitions: [
          {
            name: 'injectString',
            type: ParamType.STRING,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id = 'valeur à injecter'",
      );
    });
    it('with param array int', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where id in ({{ param }})',
        paramValues: [
          {
            name: 'param',
            value: [1, 2],
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.INT_ARRAY,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where id in (1, 2)',
      );
    });
    it('with param date', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where status = {{ param }}',
        paramValues: [
          {
            name: 'param',
            value: "2013-07-21 15:18:34",
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.DATE,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where status = '2013-07-21 15:18:34'"
      );
    });
    it('with param array float', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where id in ({{ param }})',
        paramValues: [
          {
            name: 'param',
            value: [1.2, 2],
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.FLOAT_ARRAY,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where id in (1.2, 2)',
      );
    });
    it('with param array string', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where id in ({{ param }})',
        paramValues: [
          {
            name: 'param',
            value: ['value1', 'value2'],
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.STRING_ARRAY,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id in ('value1', 'value2')",
      );
    });
    it('with param array boolean', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where status = {{ param }}',
        paramValues: [
          {
            name: 'param',
            value: true,
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.BOOLEAN,
            mandatory: true,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where status = true',
      );
    });
  });
  describe('query with optional block definition', function () {
    it('without param', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where id = 1 [[ AND optional = {{ optionalParam }} ]]',
        paramValues: [],
        paramDefinitions: [],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal('select * from table_exemple where id = 1');
    });
    it('without good optional param string', function () {
      // given
      const datamartQuery: DatamartQuery = {
        query:
          'select * from table_exemple where id = 1 [[ AND optional = {{ optionalParam }} ]]',
        paramValues: [
          {
            name: 'optionalParam',
            value: 'valeur à injecter',
          },
        ],
        paramDefinitions: [
          {
            name: 'optionalParam',
            type: ParamType.STRING,
            mandatory: false,
          },
        ],
      };

      const queryBuilder = new QueryBuilder(datamartQuery);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id = 1  AND optional = 'valeur à injecter'",
      );
    });
  });
});
