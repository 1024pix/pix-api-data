import { expect, sinon, knexAPI } from '../../../test-helper.js';
import {
  FilePath,
  doJob,
} from '../../../../scripts/prod/add-queries-from-csv.js';

describe('Integration | scripts-prod | Add queries from csv', function () {
  let dryRun: boolean, checkOnly: boolean;

  afterEach(async function () {
    await knexAPI('catalog_query_params').delete();
    await knexAPI('catalog_queries').delete();
  });

  context('query checking', function () {
    beforeEach(function () {
      dryRun = true;
      checkOnly = true;
    });

    it('should check queries and dump expected errors', async function () {
      // given
      const filePath = new FilePath(
        process.cwd(),
        'tests/integration/scripts/prod/queries-checkonly-test.csv',
      );

      // when
      const { errorMessagesByQuery } = await doJob(filePath, checkOnly, dryRun);

      // then
      const [{ count: insertedQueriesCnt }] = await knexAPI(
        'catalog_queries',
      ).count({
        count: ['id'],
      });
      const [{ count: insertedQueryParamsCnt }] = await knexAPI(
        'catalog_query_params',
      ).count({
        count: ['id'],
      });
      expect(insertedQueriesCnt).to.equal(0);
      expect(insertedQueryParamsCnt).to.equal(0);
      expect(errorMessagesByQuery[0]).to.have.members(['Pas de requête.']);
      expect(errorMessagesByQuery[1]).to.have.members([
        'Paramètre obligatoire "mandatoryParam" présent dans la requête mais non listé dans les paramètres fournis.',
      ]);
      expect(errorMessagesByQuery[2]).to.have.members([
        'Paramètre obligatoire "mandatoryParam" présent dans la requête mais non listé dans les paramètres fournis.',
        'Paramètre "mandatory_param" listé dans les paramètres fournis mais pas présent dans la requête.',
      ]);
      expect(errorMessagesByQuery[3]).to.have.members([
        'Paramètre facultatif "mandatoryParam" présent dans la requête et dans les paramètres fournis mais avec un type inexistant (type "imaginary-type" indiqué).',
      ]);
      expect(errorMessagesByQuery[4]).to.have.members([
        'Paramètre obligatoire "mandatoryParam" présent dans la requête en tant qu\'obligatoire mais fourni en tant que paramètre facultatif.',
      ]);
      expect(errorMessagesByQuery[5]).to.have.members([
        'Paramètre facultatif "optionalParam" présent dans la requête mais non listé dans les paramètres fournis.',
      ]);
      expect(errorMessagesByQuery[6]).to.have.members([
        'Paramètre facultatif "optionalParam" présent dans la requête mais non listé dans les paramètres fournis.',
        'Paramètre "optional_param" listé dans les paramètres fournis mais pas présent dans la requête.',
      ]);
      expect(errorMessagesByQuery[7]).to.have.members([
        'Paramètre facultatif "optionalParam" présent dans la requête et dans les paramètres fournis mais avec un type inexistant (type "imaginary-type" indiqué).',
      ]);
      expect(errorMessagesByQuery[8]).to.have.members([
        'Paramètre facultatif "optionalParam" présent dans la requête en tant que facultatif mais fourni en tant que paramètre obligatoire.',
      ]);
      expect(errorMessagesByQuery[9]).to.have.members([
        'Paramètre "mandatoryParam" listé dans les paramètres fournis mais pas présent dans la requête.',
      ]);
      expect(errorMessagesByQuery[10]).to.be.empty;
      expect(errorMessagesByQuery[11]).to.be.empty;
    });
  });

  context('dry run', function () {
    beforeEach(function () {
      dryRun = true;
      checkOnly = false;
    });

    it('should generate the expected SQL when all queries are valid without effectively inserting records', async function () {
      // given
      const filePath = new FilePath(
        process.cwd(),
        'tests/integration/scripts/prod/queries-dryrun-test.csv',
      );

      // when
      const { sqlByQuery } = await doJob(filePath, checkOnly, dryRun);

      // then
      const [{ count: insertedQueriesCnt }] = await knexAPI(
        'catalog_queries',
      ).count({
        count: ['id'],
      });
      const [{ count: insertedQueryParamsCnt }] = await knexAPI(
        'catalog_query_params',
      ).count({
        count: ['id'],
      });
      expect(insertedQueriesCnt).to.equal(0);
      expect(insertedQueryParamsCnt).to.equal(0);
      expect(sqlByQuery[0]).to.have.members([
        `insert into "catalog_queries" ("sql_query") values ('select * from t where id = 1') returning "id"`,
      ]);
      sinon.assert.match(
        sqlByQuery[1][0],
        `insert into "catalog_queries" ("sql_query") values ('select * from t where id = {{ mandatoryParam }} [[ AND optional = {{ optionalParam }} ]] [[ AND optional2 = {{ optionalParam2 }} ]]') returning "id"`,
      );
      sinon.assert.match(
        sqlByQuery[1][1],
        /insert into "catalog_query_params" \("catalog_query_id", "mandatory", "name", "type"\) values \('[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}', true, 'mandatoryParam', 'int'\)/,
      );
      sinon.assert.match(
        sqlByQuery[1][2],
        /insert into "catalog_query_params" \("catalog_query_id", "mandatory", "name", "type"\) values \('[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}', false, 'optionalParam', 'string'\)/,
      );
      sinon.assert.match(
        sqlByQuery[1][3],
        /insert into "catalog_query_params" \("catalog_query_id", "mandatory", "name", "type"\) values \('[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}', false, 'optionalParam2', 'date-time'\)/,
      );
    });
  });

  context('real execution', function () {
    beforeEach(function () {
      dryRun = false;
      checkOnly = false;
    });

    it('should not insert anything if not all queries are valid', async function () {
      // given
      const filePath = new FilePath(
        process.cwd(),
        'tests/integration/scripts/prod/queries-failexec-test.csv',
      );

      // when
      await doJob(filePath, checkOnly, dryRun);

      // then
      const [{ count: insertedQueriesCnt }] = await knexAPI(
        'catalog_queries',
      ).count({
        count: ['id'],
      });
      const [{ count: insertedQueryParamsCnt }] = await knexAPI(
        'catalog_query_params',
      ).count({
        count: ['id'],
      });
      expect(insertedQueriesCnt).to.equal(0);
      expect(insertedQueryParamsCnt).to.equal(0);
    });

    it('should insert in database queries and params when all queries from file are valid', async function () {
      // given
      const filePath = new FilePath(
        process.cwd(),
        'tests/integration/scripts/prod/queries-successexec-test.csv',
      );

      // when
      await doJob(filePath, checkOnly, dryRun);

      // then
      const catalogQueriesDTO = await knexAPI('catalog_queries')
        .select(['id', 'sql_query'])
        .orderBy('created_at', 'ASC');
      const catalogQueryParamsDTO = await knexAPI('catalog_query_params')
        .select(['catalog_query_id', 'name', 'type', 'mandatory'])
        .orderBy('id', 'ASC');
      expect(catalogQueriesDTO).to.have.length(2);
      sinon.assert.match(catalogQueriesDTO[0], {
        id: sinon.match(
          /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/,
        ),
        sql_query: 'select * from t where id = 1',
      });
      sinon.assert.match(catalogQueriesDTO[1], {
        id: sinon.match(
          /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/,
        ),
        sql_query:
          'select * from t where id = {{ mandatoryParam }} [[ AND optional = {{ optionalParam }} ]] [[ AND optional2 = {{ optionalParam2 }} ]]',
      });
      const firstQueryParams = catalogQueryParamsDTO.filter(
        (paramDTO) => paramDTO.catalog_query_id === catalogQueriesDTO[0].id,
      );
      expect(firstQueryParams).to.be.empty;
      const secondQueryParams = catalogQueryParamsDTO.filter(
        (paramDTO) => paramDTO.catalog_query_id === catalogQueriesDTO[1].id,
      );
      expect(secondQueryParams[0]).to.deep.equal({
        catalog_query_id: catalogQueriesDTO[1].id,
        name: 'mandatoryParam',
        type: 'int',
        mandatory: true,
      });
      expect(secondQueryParams[1]).to.deep.equal({
        catalog_query_id: catalogQueriesDTO[1].id,
        name: 'optionalParam',
        type: 'string',
        mandatory: false,
      });
      expect(secondQueryParams[2]).to.deep.equal({
        catalog_query_id: catalogQueriesDTO[1].id,
        name: 'optionalParam2',
        type: 'date-time',
        mandatory: false,
      });
    });
  });
});
