const TABLE_NAME = 'catalog_query_params';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.uuid('catalog_query_id').references('catalog_queries.id');
    t.string('name').notNullable();
    t.enum('type', [
      'string',
      'int',
      'date',
      'date-time',
      'float',
      'boolean',
      'string-array',
      'int-array',
      'float-array',
    ]);
    t.boolean('mandatory').notNullable();
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
