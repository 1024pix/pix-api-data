const TABLE_NAME = 'user-logins';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.bigIncrements().primary();
    t.uuid('userId')
      .references('users.id')
      .notNullable()
      .unique()
      .comment("Identifiant de l'utilisateur");
    t.dateTime('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Date de la création du tuple');
    t.dateTime('updatedAt')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Date de la dernière mise à jour du tuple');
    t.dateTime('blockedAt')
      .nullable()
      .comment("Date du blocage de l'utilisateur");
    t.dateTime('temporaryBlockedUntil')
      .nullable()
      .comment('Date de fin de blocage');
    t.integer('failureCount')
      .notNullable()
      .defaultTo(0)
      .comment('Nombre de connexion en échec depuis la dernière connexion');
    t.dateTime('lastLoggedAt')
      .defaultTo(null)
      .comment('Date de la dernière connexion');
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
