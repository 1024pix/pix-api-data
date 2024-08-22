const TABLE_NAME = 'query_access';

function up(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.uuid('user_id').notNullable();
    t.uuid('query_id').notNullable();
    t.primary(['user_id', 'query_id']);
    t.foreign('user_id').references('id').inTable('users');
    t.foreign('query_id').references('id').inTable('catalog_queries');
  });
}

function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}

export { down, up };
