CREATE TABLE public.data_ref_academies (
	id int4 NULL,
	nom text NULL,
	region text NULL,
	departements _int4 NULL
);


INSERT INTO public.data_ref_academies (id,nom,region,departements) VALUES
	 (1,'Normandie','Normandie','{14,50,61,27,76,975}'),
	 (2,'Polynésie française','sans région','{984}'),
	 (3,'Aix-Marseille','Provence-Alpes-Côte d''Azur','{4,5,13,84}'),
	 (4,'Orléans-Tours','Centre-Val de Loire','{18,28,36,37,41,45}'),
	 (5,'Wallis et Futuna','sans région','{987}'),
	 (6,'Strasbourg','Grand Est','{67,68}'),
	 (7,'Guyane','Guyane','{973}'),
	 (8,'Besançon','Bourgogne-Franche-Comté','{25,39,70,90}'),
	 (9,'Nouvelle-Calédonie','sans région','{983}'),
	 (10,'Versailles','Île-de-France','{78,91,92,95}');
INSERT INTO public.data_ref_academies (id,nom,region,departements) VALUES
	 (12,'Poitiers','Nouvelle-Aquitaine','{16,17,79,86}'),
	 (13,'Créteil','Île-de-France','{77,93,94}'),
	 (15,'Toulouse','Occitanie','{9,12,31,32,46,65,81,82}'),
	 (16,'Reims','Grand Est','{8,10,51,52}'),
	 (17,'Amiens','Hauts-de-France','{2,60,80}'),
	 (18,'Guadeloupe','Guadeloupe','{971}'),
	 (19,'Montpellier','Occitanie','{11,30,34,48,66}'),
	 (20,'Mayotte','Mayotte','{976}'),
	 (21,'Nice','Provence-Alpes-Côte d''Azur','{6,83}'),
	 (22,'Nantes','Pays de la Loire','{44,49,53,72,85}');
INSERT INTO public.data_ref_academies (id,nom,region,departements) VALUES
	 (23,'Grenoble','Auvergne-Rhône-Alpes','{7,26,38,73,74}'),
	 (24,'Paris','Île-de-France','{75}'),
	 (25,'Martinique','Martinique','{972}'),
	 (26,'Rennes','Bretagne','{22,29,35,56}'),
	 (27,'Nancy-Metz','Grand Est','{54,55,57,88}'),
	 (28,'Lille','Hauts-de-France','{59,62}'),
	 (29,'Dijon','Bourgogne-Franche-Comté','{21,58,71,89}'),
	 (30,'Bordeaux','Nouvelle-Aquitaine','{24,33,40,47,64}'),
	 (31,'Corse','Corse','{720,620}'),
	 (32,'Lyon','Auvergne-Rhône-Alpes','{1,42,69}');
INSERT INTO public.data_ref_academies (id,nom,region,departements) VALUES
	 (33,'Limoges','Nouvelle-Aquitaine','{19,23,87}'),
	 (34,'La Réunion','La Réunion','{974}'),
	 (35,'Clermont-Ferrand','Auvergne-Rhône-Alpes','{3,15,43,63}');
