import { expect } from '../../../test-helper.ts';
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
      expect(queryResult).to.deep.equal({
        query: 'select * from table_exemple\nwhere id = 1',
        params: {},
      });
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
      expect(queryResult).to.deep.equal({
        query: 'select * from table_exemple where id = :injectString',
        params: { injectString: 'valeur à injecter' },
      });
    });
    it('with every parameter type params', function () {
      // given
      const datamartQueryModel = new DatamartQueryModel({
        query: 'select * from table_exemple where id = any({{ paramIntArray }}) and date = {{ paramDate }} and floatParam = any({{ paramFloatArray }}) and paramString = any({{ paramStringArray }}) and univers = {{ paramBoolean }}',
        paramValues: [
          {
            name: 'paramIntArray',
            value: [1, 2],
          },
          {
            name: 'paramDate',
            value: '2013-07-21 15:18:34',
          },
          {
            name: 'paramFloatArray',
            value: [1.2, 2],
          },
          {
            name: 'paramStringArray',
            value: ['value1', 'value2'],
          },
          {
            name: 'paramBoolean',
            value: true,
          },
        ],
        paramDefinitions: [
          {
            name: 'paramIntArray',
            type: ParamType.INT_ARRAY,
            mandatory: true,
          },
          {
            name: 'paramDate',
            type: ParamType.DATE,
            mandatory: true,
          },
          {
            name: 'paramFloatArray',
            type: ParamType.FLOAT_ARRAY,
            mandatory: true,
          },
          {
            name: 'paramStringArray',
            type: ParamType.STRING_ARRAY,
            mandatory: true,
          },
          {
            name: 'paramBoolean',
            type: ParamType.BOOLEAN,
            mandatory: true,
          },
        ],
      });
      const queryBuilder = new QueryBuilder(datamartQueryModel);

      // when
      const queryResult = queryBuilder.build();

      // then
      expect(queryResult).to.deep.equal({
        query:
          'select * from table_exemple where id = any(:paramIntArray) and date = :paramDate and floatParam = any(:paramFloatArray) and paramString = any(:paramStringArray) and univers = :paramBoolean',
        params: {
          paramIntArray: [1, 2],
          paramDate: '2013-07-21 15:18:34',
          paramFloatArray: [1.2, 2],
          paramStringArray: ['value1', 'value2'],
          paramBoolean: true,
        },
      });
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
      expect(queryResult).to.deep.equal({
        query: 'select * from table_exemple where id = 1',
        params: {},
      });
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
      expect(queryResult).to.deep.equal({
        query:
          'select * from table_exemple where id = 1  AND optional = :optionalParam',
        params: { optionalParam: 'valeur à injecter' },
      });
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
      expect(queryResult).to.deep.equal({
        query:
          'select * from table_exemple where id = 1 \n\n  AND optional2 = :optionalParam2',
        params: { optionalParam2: 'valeur à injecter2' },
      });
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
      expect(queryResult).to.deep.equal({
        query:
          'select * from table_exemple where id = 1 \n AND optional \n= :optionalParam \n  AND optional2 = :optionalParam2',
        params: {
          optionalParam: 'valeur à injecter',
          optionalParam2: 'valeur à injecter2',
        },
      });
    });
  });
});
