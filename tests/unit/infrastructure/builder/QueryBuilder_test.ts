import { expect } from 'chai';
import { QueryBuilder } from '../../../../lib/infrastructure/builder/QueryBuilder.ts';
import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery.ts';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem.ts';

describe('Unit | Query builder', function () {
  context('query without optional block definition', function () {
    it('it should return a query without param', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple\nwhere id = 1',
        paramValues: [],
        paramDefinitions: [],
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal('select * from table_exemple\nwhere id = 1');
    });
    it('it should return a query with mandatory param', function () {
      // given
      const datamartQuery = new DatamartQueryModel({
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
      });

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
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id in ({{ param }})',
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
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where id in (1, 2)',
      );
    });
    it('with param date', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where status = {{ param }}',
        paramValues: [
          {
            name: 'param',
            value: '2013-07-21 15:18:34',
          },
        ],
        paramDefinitions: [
          {
            name: 'param',
            type: ParamType.DATE,
            mandatory: true,
          },
        ],
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where status = '2013-07-21 15:18:34'",
      );
    });
    it('with param array float', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id in ({{ param }})',
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
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where id in (1.2, 2)',
      );
    });
    it('with param array string', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id in ({{ param }})',
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
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id in ('value1', 'value2')",
      );
    });
    it('with param array boolean', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where status = {{ param }}',
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
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        'select * from table_exemple where status = true',
      );
    });
  });
  context('query with optional block definition', function () {
    it('it should return a query without optional block', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query:
          'select * from table_exemple where id = 1 [[ AND optional = {{ optionalParam }} ]] [[ AND optional2 = {{ optional2Param }} ]]',
        paramValues: [],
        paramDefinitions: [],
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal('select * from table_exemple where id = 1');
    });
    it('it should return a query with one optional block', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
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
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id = 1  AND optional = 'valeur à injecter'",
      );
    });
    it('it should return query with only one optional block of two', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query:
          'select * from table_exemple where id = 1 \n[[ AND optional \n= {{ optionalParam }} ]]\n [[ AND optional2 = {{ optionalParam2 }} ]]',
        paramValues: [
          {
            name: 'optionalParam2',
            value: 'valeur à injecter2',
          },
        ],
        paramDefinitions: [
          {
            name: 'optionalParam',
            type: ParamType.STRING,
            mandatory: false,
          },
          {
            name: 'optionalParam2',
            type: ParamType.STRING,
            mandatory: false,
          },
        ],
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id = 1 \n\n  AND optional2 = 'valeur à injecter2'",
      );
    });
    it('it should return good query when have some optional block', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query:
          'select * from table_exemple where id = 1 \n[[ AND optional \n= {{ optionalParam }} ]]\n [[ AND optional2 = {{ optionalParam2 }} ]]',
        paramValues: [
          {
            name: 'optionalParam',
            value: 'valeur à injecter',
          },
          {
            name: 'optionalParam2',
            value: 'valeur à injecter2',
          },
        ],
        paramDefinitions: [
          {
            name: 'optionalParam',
            type: ParamType.STRING,
            mandatory: false,
          },
          {
            name: 'optionalParam2',
            type: ParamType.STRING,
            mandatory: false,
          },
        ],
      });

      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.equal(
        "select * from table_exemple where id = 1 \n AND optional \n= 'valeur à injecter' \n  AND optional2 = 'valeur à injecter2'",
      );
    });
  });
});
