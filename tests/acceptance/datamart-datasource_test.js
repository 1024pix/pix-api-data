import { knex } from '../../lib/common/db/knex-database-connection.js';
import { expect } from 'chai';

describe('Acceptance | count data_ref_academies rows', function () {
  it('It should insert data', async function () {
    //when
    await knex('public.data_ref_academies').select();
    //then
    const regionCount = await knex('public.data_ref_academies')
      .select()
      .count();
    expect(regionCount).to.deep.equal([{ count: 33 }]);
  });
});
