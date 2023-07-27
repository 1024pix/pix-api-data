import { expect } from '../../../test-helper.js';
import { FilePath, checkQuery } from '../../../../scripts/prod/check-query.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | scripts-prod | Check query', function () {
  it('should check queries and dump expected errors', async function () {
    // given
    const filePath = new FilePath(__dirname, './queries-syntax-test.csv');

    // when
    const { messagesByLine } = await checkQuery(filePath, false);

    // then
    expect(messagesByLine[0]).to.have.members(['Pas de requête.']);
    expect(messagesByLine[1]).to.have.members([
      'Paramètre obligatoire "mandatoryParam" présent dans la requête mais non listé dans les paramètres fournis.',
    ]);
    expect(messagesByLine[2]).to.have.members([
      'Paramètre obligatoire "mandatoryParam" présent dans la requête mais non listé dans les paramètres fournis.',
      'Paramètre "mandatory_param" listé dans les paramètres fournis mais pas présent dans la requête.',
    ]);
    expect(messagesByLine[3]).to.have.members([
      'Paramètre facultatif "mandatoryParam" présent dans la requête et dans les paramètres fournis mais avec un type inexistant (type "imaginary-type" indiqué).',
    ]);
    expect(messagesByLine[4]).to.have.members([
      'Paramètre obligatoire "mandatoryParam" présent dans la requête en tant qu\'obligatoire mais fourni en tant que paramètre facultatif.',
    ]);
    expect(messagesByLine[5]).to.have.members([
      'Paramètre facultatif "optionalParam" présent dans la requête mais non listé dans les paramètres fournis.',
    ]);
    expect(messagesByLine[6]).to.have.members([
      'Paramètre facultatif "optionalParam" présent dans la requête mais non listé dans les paramètres fournis.',
      'Paramètre "optional_param" listé dans les paramètres fournis mais pas présent dans la requête.',
    ]);
    expect(messagesByLine[7]).to.have.members([
      'Paramètre facultatif "optionalParam" présent dans la requête et dans les paramètres fournis mais avec un type inexistant (type "imaginary-type" indiqué).',
    ]);
    expect(messagesByLine[8]).to.have.members([
      'Paramètre facultatif "optionalParam" présent dans la requête en tant que facultatif mais fourni en tant que paramètre obligatoire.',
    ]);
    expect(messagesByLine[9]).to.have.members([
      'Paramètre "mandatoryParam" listé dans les paramètres fournis mais pas présent dans la requête.',
    ]);
    expect(messagesByLine[10]).to.be.empty;
    expect(messagesByLine[11]).to.be.empty;
  });
  it('should generate the expected SQL for valid queries', async function () {
    // given
    const filePath = new FilePath(__dirname, './queries-sql-test.csv');

    // when
    const { sql } = await checkQuery(filePath, true);

    // then
    expect(sql[0]).to.have.members(['Requête invalide, pas de SQL généré.']);
    expect(sql[1]).to.have.members([
      `insert into "catalog_queries" ("sql_query") values ('select * from t where id = 1')`,
    ]);
    expect(sql[2]).to.have.members([
      `insert into "catalog_queries" ("sql_query") values ('select * from t where id = {{ mandatoryParam }} [[ AND optional = {{ optionalParam }} ]] [[ AND optional2 = {{ optionalParam2 }} ]]')`,
      `insert into "catalog_query_params" ("catalog_query_id", "mandatory", "name", "type") values ('<REPLACE_ME_WITH_CATALOG_QUERY_ID>', true, 'mandatoryParam', 'int')`,
      `insert into "catalog_query_params" ("catalog_query_id", "mandatory", "name", "type") values ('<REPLACE_ME_WITH_CATALOG_QUERY_ID>', false, 'optionalParam', 'string')`,
      `insert into "catalog_query_params" ("catalog_query_id", "mandatory", "name", "type") values ('<REPLACE_ME_WITH_CATALOG_QUERY_ID>', false, 'optionalParam2', 'date-time')`,
    ]);
  });
});
