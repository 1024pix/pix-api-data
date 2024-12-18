import { env } from 'node:process';
import bcrypt from 'bcrypt';

function _getNumber(numberAsString, defaultValue) {
  const number = Number.parseInt(numberAsString, 10);
  return Number.isNaN(number) ? defaultValue : number;
}

export const SEED_PARAMETERS = {
  REF_ACADEMY_QUERY_ID: '1b7291d4-ac51-46d3-97f1-f5f304100a29',
  REF_ACADEMY_USER: 'dev',
  REF_ACADEMY_USER_PASSWORD: 'LeMotDePasseQueL\'UtilisateurUtiliseraitDeSonPointDeVue',
  REF_ACADEMY_PARAM_NAME: 'id_list',
  REF_ACADEMY_PARAM_VALUE: 2,
};

export const seed = async function (knex) {
  await knex('catalog_queries').insert({
    name: 'Nombre d\'académies',
    sql_query: 'SELECT COUNT(*) FROM data_ref_academies',
    id: '1b7291d4-ac51-46d2-97f1-f5f304100a29',
    created_at: new Date('2021-10-29T03:04:00Z'),
  });

  await knex('catalog_queries').insert({
    name: 'Académies filtrées par liste d\'id',
    sql_query:
      'SELECT id, nom, region, departements FROM data_ref_academies WHERE id = any({{ id_list }})',
    id: SEED_PARAMETERS.REF_ACADEMY_QUERY_ID,
    created_at: new Date('2022-05-14T13:24:00Z'),
  });
  await knex('catalog_query_params').insert({
    id: 1,
    catalog_query_id: SEED_PARAMETERS.REF_ACADEMY_QUERY_ID,
    name: SEED_PARAMETERS.REF_ACADEMY_PARAM_NAME,
    type: 'int-array',
    mandatory: true,
  });

  const hashedPassword = await bcrypt.hash(
    SEED_PARAMETERS.REF_ACADEMY_USER_PASSWORD,
    _getNumber(env.BCRYPT_NUMBER_OF_SALT_ROUNDS, 10),
  );

  const userId = '456f9d47-39a7-4de6-ada2-e47662b79bf3';
  await knex('users').insert({
    id: userId,
    username: SEED_PARAMETERS.REF_ACADEMY_USER,
    label: 'Utilisateur de test',
    hashed_password: hashedPassword,
    created_at: new Date('2021-10-29T03:04:00Z'),
  });

  await knex('query_access').insert({
    user_id: userId,
    query_id: SEED_PARAMETERS.REF_ACADEMY_QUERY_ID,
  });

  await knex('query_param_access').insert({
    user_id: userId,
    query_param_id: 1,
    value: `${SEED_PARAMETERS.REF_ACADEMY_PARAM_VALUE}`,
  });
  await knex('query_param_access').insert({
    user_id: userId,
    query_param_id: 1,
    value: '4',
  });
};
