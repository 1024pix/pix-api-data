const TABLE_NAME = 'users';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('label').notNullable();
    t.string('username').unique().notNullable();
    t.string('password').notNullable();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
