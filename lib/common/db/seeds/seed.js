const seed = async function (knex) {
  await knex('catalog_queries').insert({
    sql_query: 'SELECT COUNT(*) FROM public.data_ref_academies',
    id: '1b7291d4-ac51-46d2-97f1-f5f304100a29',
    created_at: new Date('2021-10-29T03:04:00Z'),
  });
};

export { seed };
