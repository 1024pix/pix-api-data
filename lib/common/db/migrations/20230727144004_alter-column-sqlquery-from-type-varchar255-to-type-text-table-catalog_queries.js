const TABLE_NAME = 'catalog_queries';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.text('sql_query').alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.string('sql_query').alter();
  });
};

export { up, down };
