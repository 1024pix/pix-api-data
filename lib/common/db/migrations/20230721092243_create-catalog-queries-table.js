const TABLE_NAME = 'catalog_queries';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('sql_query').notNullable();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
