const TABLE_NAME = 'query_param_access';

function up(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable();
    t.integer('query_param_id').notNullable();
    t.string('value').notNullable();
    t.foreign('user_id').references('id').inTable('users');
    t.foreign('query_param_id')
      .references('id')
      .inTable('catalog_query_params');
  });
}

function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}

export { down, up };
