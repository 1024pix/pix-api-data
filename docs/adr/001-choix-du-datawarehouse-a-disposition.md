# 1. Choix du Datawarehouse à disposition

Date : 2024-06-28

## État

Accepté

## Contexte

Le projet API Data a la volonté de mettre à disposition des données spécifiques à différents acteurs. 
Ces données sont issues de la base de données de Pix, et sont transformées par l'équipe data pour être plus facilement 
utilisables par les acteurs.

Les données transformées sont stockées dans un datawarehouse. 
Ce datawarehouse comporte les données de production ainsi que les données transformées. 

## Solution n°1 : Utiliser le Datawarehouse existant

Avantages :
- Les données transformées sont déjà disponibles

Inconvénients :
- Les données de production sont "accessibles" ce qui peut poser des problèmes de sécurité
- La charge de lecture sur le datawarehouse de production est augmentée


## Solution n°2 : Créer un Datawarehouse dédié à l'API Data

Avantages :
- Uniquement les données que nous souhaitons sont disponibles
- Pas de charge supplémentaire sur le datawarehouse de production

Inconvénients : 
- Il faut mettre en place des environnements

## Décision

Nous choisissons la solution n°2 : Créer un Datawarehouse dédié à l'API Data. 