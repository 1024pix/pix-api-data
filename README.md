# Pix Api Data

API permettant d'interroger le datamart avec des requêtes préparées par l'équipe Data.

Le Datamart est la base datawarehouse-data constituée de tables copiées depuis la production de Pix
et de dataset produits par l'équipe data à partir de la production également.

L'objectif du projet, initié lors des Tech Days 2023, est d'offrir dans sa première version un service de récupération de données statistiques aux applications Pix (orga / admin) et dans un second temps à des tiers.

## Fonctionnement
L'API présente un catalogue de requêtes paramétrables à faire exécuter.
Le client authentifié formule une demande d'exécution d'une requête en indiquant son ID et les paramètres
qu'il souhaite y injecter.
L'API retourne les résultats de l'exécution de cette requête.

## Architecture
![schema_architecture.png](docs%2Fimages%2Fschema_architecture.png)
L'ensemble est constitué d'un serveur Node connecté à deux bases de données :
- `API_DATABASE`: la base de données dédiée à l'API.
  Elle contient les données utilisateurs ainsi que le catalogue des requêtes exécutables par les utilisateurs. Elle est hébergée au même endroit que l'API.
  L'adresse de cette base est lue depuis la variable d'environnement `DATABASE_API_URL`.
- `DATAMART_DATABASE`: la base de données sur laquelle les requêtes demandées par l'utilisateur vont être exécutées.
  Cette base n'est consultée qu'en lecture uniquement et est externe à l'API. L'adresse de cette base est lue depuis la variable d'environnement `DATAMART_DATABASE_URL`.

### Les bases de données en fonction de l'environnement

#### Développement
- `API_DATABASE`: serveur PG local via Docker sur une base de développement. Les données proviennent des seeds.
- `DATAMART_DATABASE`: serveur PG local via Docker. Les données proviennent d'un script SQL exécuté au démarrage du container Docker (dans `data/sql/init_db.sql`).

#### Tests auto
- `API_DATABASE`: serveur PG local via Docker sur une base de test. Les données proviennent des tests.
- `DATAMART_DATABASE`: serveur PG local via Docker. Les données proviennent d'un script SQL exécuté au démarrage du container Docker (dans `data/sql/init_db.sql`).

#### Intégration
- `API_DATABASE`: add-on PG provisionné sur l'application de l'API sur Scalingo. Les données proviennent des seeds ainsi que de l'usage.
- `DATAMART_DATABASE`: idem que `API_DATABASE`. Le script `data/sql/init_db.sql` a été exécuté sur cette base afin d'avoir un set de données minimal pour tester.

#### Production
- `API_DATABASE`: add-on PG provisionné sur l'application de l'API sur Scalingo. Les données proviennent de l'usage.
- `DATAMART_DATABASE`: base externe (a priori `datawarehouse-data`).

## Lancement du serveur en local

### Opérations à réaliser

Copier le fichier `sample.env` en `.env`.

Puis lancer les commandes suivantes :

* `docker-compose up` -> démarrage des instances Postgres `API_DATABASE` et `DATAMART_DATABASE`
* `npm ci`-> installation des packages du projet
* `npm run db:reset` -> reset de la base `API_DATABASE` contenant les requêtes et les utilisateurs
* `npm run start` -> démarrage du serveur Node

### Tests autos

* `npm run test`

### Tests manuels

Lancer les requêtes présentes dans le répertoire `tests/sample-requests`
(natif sur WebStorm, nécessite le plugin RestClient sur VSCode).
Les réponses doivent correspondre aux commentaires présents en-tête des requêtes.
L'exécution d'une requête sur `/query` nécessite en premier lieu de récupérer un token d'authentification
via la route `/token`, puis de positionner ce token dans l'en-tête (après `"Bearer "`).

## Ajout de requêtes

Une requête est composée :
- d'un template SQL paramétrable
- de la liste de paramètres associée au template

Les requêtes sont stockées dans la base `pix_api_data`.

### Syntaxe du template SQL

#### Sans paramètre

Rédiger une requête standard.

Exemple :
```sql
SELECT count(*) from data_ref_academies
```

#### Avec paramètres

Rédiger une requête ou les valeurs de paramètres sont remplacées par un token du type `{{ nom_parametre }}` (les espaces dans les accolades sont obligatoires)

Exemple :
```sql
SELECT nom, region from data_ref_academies where id = {{ id_academie }}
```

Le paramètre est ici : `id_academie`. Il a pour type `int` et est obligatoire.nécessaire
Si le type envoyé ne correspond pas au type défini, l'api renverra une erreur.

##### Types de paramètres

* string
* int
* date : au format `YYYY-MM-DD`
* date-time : au format `YYYY-MM-DD HH:mm:ss`
* float
* boolean : true ou false uniquement (pas de O/N, 0/1)
* string-array
* int-array
* float-array

##### Caractère obligatoire / facultatif

Il est possible de définir un bloc comme étant facultatif à l'aide de crochets. Le bloc entre crochets ne sera ajouté que si les paramètres sont renseignées dans l'appel.

Exemple :
```sql
SELECT nom, region FROM data_ref_academies WHERE 1=1 [[ AND id = {{ id_1 }} ]]
```

Les valeurs des paramètres obligatoires doivent systématiquement être fournies par l'utilisateur de l'API pour
exécuter la requête concernée. Ils seront donc systématiquement injectés dans la requête et ne nécessitent aucune précaution particulière dans la rédaction de la requête.
Les blocs facultatifs quand à eux, amènent un cas particulier :
- Si un bloc facultatif contient plusieurs paramètres, si un paramètre est renseigné, il est nécessaire que chacun des autres paramètres soie renseigné, par exemple dans la requête ci-dessous, si un des deux élements n'est pas renseigné l'API renverra une erreur :

```sql
SELECT nom, region FROM data_ref_academies WHERE 1=1 AND [[ (id = {{ id_1 }} OR id = {{ id_2 }}) ]]
```


##### Cas particulier des clauses : WHERE ... IN
L'injection d'un tableau via `knex` oblige l'utilisation du `= ANY()` à la place du `IN`. En effet un tableau`[1, 2]`sera converti en `'{1,2}'`.

Exemple:
```sql
SELECT nom, region FROM data_ref_academies WHERE id = ANY( {{ id_array }} )
```

Pour le `NOT IN` il faut passer par la fonction `ALL()`.

Exemple:
```sql
SELECT nom, region FROM data_ref_academies WHERE id <> ALL( {{ id_array }} )
```

### Insertion dans la base
Pour le moment il n'existe pas de cli/interface pour des insertions dans la base `DATAMART_DATABASE`,
il faut se connecter directement sur la base `pix_api_data` et exécuter les lignes de commande d'insertions
```sql
INSERT INTO catalog_queries(query_id, sql_query, created_at) VALUES (UUID, my_query, my_params);
INSERT INTO catalog_query_params(catalog_query_id, name, type, mandatory) VALUES (UUID, name, param_type, boolean);
```

## Ajout d'un utilisateur

Il est réalisé en ajoutant un enregistrement dans la tables Users en BDD à l'aide des commandes suivantes :

```bash
scalingo --app pix-api-data-production run node build/scripts/prod/add-user.js --username <userName> --label <userLabel> --password <userPassword>
```

## Utilisation de l'API

### Authentification
Il faut récupérer un token en se connectant avec un login/mot de passe valide via un
```
POST http://DATABASE_API_URL/token
```
avec en paramètre
```
{
"username": "dev",
"password": "LeMotDePasseQueL'UtilisateurUtiliseraitDeSonPointDeVue"
}
```
On récupérera le token dans la réponse
```
ACCESS_TOKEN=${response.body.data}
```

### Utilisation d'une requête
Sans paramètre utilisé dans la requête
```
POST http://DATABASE_API_URL:3000/query
```
Pour l'autorisation:
```
Authorization: Bearer ACCESS_TOKEN
```
et en paramètre de post
```
{
 "queryId": "UUID",
 "params": []
}
```

Avec paramètre utilisé dans la requête
Il n'y a pas besoin de spécifier si les paramètres sont obligatoires voir [ici](#caractère-obligatoire--facultatif)
```
POST http://DATABASE_API_URL:3000/query
```
Pour l'autorisation:
```
Authorization: Bearer ACCESS_TOKEN
```
et en paramètre de post
```
{
 "queryId": "UUID",
 "params":[
  {
   "name": "id_list",
   "value": [1, 10, 20, 30]
  }
 ]
}
```
