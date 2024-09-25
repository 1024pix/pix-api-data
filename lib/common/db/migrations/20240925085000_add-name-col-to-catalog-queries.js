const TABLE_NAME = 'catalog_queries';

const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, (t) => {
    t.string('name')
      .comment('Nom de la requête');
  });
  await knex(TABLE_NAME).update({ name: '' });
  return knex.raw(`alter table ${TABLE_NAME} alter column name set NOT NULL`);
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.dropColumn('name');
  });
};

export { down, up };
