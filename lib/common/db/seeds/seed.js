const seed = async function (knex) {
  await knex('catalog_queries').insert({
    sql_query: 'SELECT COUNT(*) FROM data_ref_academies',
    id: '1b7291d4-ac51-46d2-97f1-f5f304100a29',
    created_at: new Date('2021-10-29T03:04:00Z'),
  });

  await knex('catalog_queries').insert({
    sql_query:
      'SELECT id, nom, region, departements FROM data_ref_academies WHERE id IN ({{id_list}})',
    id: 'b1e20492-8775-47f3-926d-3729ee2b836d',
    created_at: new Date('2022-05-14T13:24:00Z'),
  });
  await knex('catalog_query_params').insert({
    catalog_query_id: 'b1e20492-8775-47f3-926d-3729ee2b836d',
    name: 'id_list',
    type: 'int-array',
    mandatory: true,
  });
};

export { seed };
