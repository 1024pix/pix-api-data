const TABLE_NAME = 'catalog_requests';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('request').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
