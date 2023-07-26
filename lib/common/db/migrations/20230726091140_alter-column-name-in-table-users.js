const TABLE_NAME = 'users';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.renameColumn('password', 'hashed_password');
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.renameColumn('hashed_password', 'password');
  });
};

export { up, down };
