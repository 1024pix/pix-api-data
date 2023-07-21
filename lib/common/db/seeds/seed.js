const seed = async function (knex) {
  await knex('catalog_requests').insert({
    request: 'SELECT COUNT(*) FROM public.data_ref_academies',
    id: '1b7291d4-ac51-46d2-97f1-f5f304100a29',
  });
};

export { seed };
