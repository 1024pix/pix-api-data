import bcrypt from 'bcrypt';

function _getNumber(numberAsString, defaultValue) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultValue : number;
}
const seed = async function (knex) {
  await knex('catalog_queries').insert({
    sql_query: 'SELECT COUNT(*) FROM data_ref_academies',
    id: '1b7291d4-ac51-46d2-97f1-f5f304100a29',
    created_at: new Date('2021-10-29T03:04:00Z'),
  });

  await knex('catalog_queries').insert({
    sql_query:
      'SELECT id, nom, region, departements FROM data_ref_academies WHERE id = any({{ id_list }})',
    id: 'b1e20492-8775-47f3-926d-3729ee2b836d',
    created_at: new Date('2022-05-14T13:24:00Z'),
  });
  await knex('catalog_query_params').insert({
    catalog_query_id: 'b1e20492-8775-47f3-926d-3729ee2b836d',
    name: 'id_list',
    type: 'int-array',
    mandatory: true,
  });

  const hashedPassword = await bcrypt.hash(
    "LeMotDePasseQueL'UtilisateurUtiliseraitDeSonPointDeVue",
    _getNumber(process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS, 10),
  );
  await knex('users').insert({
    id: '456f9d47-39a7-4de6-ada2-e47662b79bf3',
    username: 'dev',
    label: 'Utilisateur de test',
    hashed_password: hashedPassword,
    created_at: new Date('2021-10-29T03:04:00Z'),
  });
};

export { seed };
