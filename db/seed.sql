/**
THIS FILE CONTAINS ALL THE SEE DATA
**/

/** Directorate data **/
SET FOREIGN_KEY_CHECKS=0;

TRUNCATE table directorate;

INSERT INTO directorate (name,description) VALUES
	 ('DA','Directorate of Administration'),
     ('DRG','Directorate of Regions'),
     ('DOPS','Directorate of Operations'),
     ('DTRG','Directorates of Training'),
     ('DEL','Directorate of External Liaison'),
     ('DINSP','Directorate of Inspection'),
     ('DST','Directorate of Science & Technology'),
     ('DRA','Directorate of Research & Analysis');


/** Department data **/
TRUNCATE table department;

INSERT INTO flask.department (name,description,directorate_id) VALUES
	 ('HR','Human Resource',1),
     ('Finance','Finance',1),
     ('Training','Training',4),
     ('Vetting','Vetting',6),
     ('Gen Ops','Gen Ops',3),
     ('CITU','CITU',3),
     ('TECH OPS','TECH OPS',7),
     ('SWI','SWI',7),
     ('SIGINT','SIGINT',7),
     ('R&A','R&A',8),
     ('RIDU','RIDU',8);


/** Unit data **/
TRUNCATE table unit;

INSERT INTO flask.unit (name,description,department_id) VALUES
	 ('WEBINT','WEBINT',7),
	 ('RIDU','RIDU',11),
	 ('SI','SCI. INT',7);


/** Unit cadre **/
TRUNCATE table cadre;

INSERT INTO flask.cadre (name) VALUES
	 ('Operation'),
	 ('Professional'),
	 ('General');


-- /** Unit rank **/
-- TRUNCATE table `rank`;

-- INSERT INTO flask.`rank` (name,description,`level`,cadre_id) VALUES
-- 	 ('Director','Director',17,1),
-- 	 ('Deputy Director','Deputy Director',16,1),
-- 	 ('Assistant Director','Assistant Director',15,1),
-- 	 ('CIO','Chief Intelligence Officer',14,1),
-- 	 ('ACIO','Assistant Chief Intelligence Officer',13,1),
-- 	 ('PIO','Principal Intelligence Officer',12,1),
-- 	 ('SIO','Senior Intelligence Officer',10,1),
-- 	 ('IO-I','Intelligence Officer I',9,1),
-- 	 ('IO-II','Intelligence Officer II',8,1);
	
-- INSERT INTO flask.`rank` (name,description,`level`,cadre_id) VALUES
-- 	 ('Director','Director',17,2),
-- 	 ('Deputy Director','Deputy Director',16,2),
-- 	 ('Assistant Director','Assistant Director',15,2),
-- 	 ('CIO','Chief Intelligence Officer',14,2),
-- 	 ('ACIO','Assistant Chief Intelligence Officer',13,2),
-- 	 ('PIO','Principal Intelligence Officer',12,2),
-- 	 ('SIO','Senior Intelligence Officer',10,2),
-- 	 ('IO-I','Intelligence Officer I',9,2),
-- 	 ('IO-II','Intelligence Officer II',8,2),
--      ('SIA','Senior Intelligence Assistant',7,2),
-- 	 ('AIS-I','Assistant Intelligence Staff I',6,2),
-- 	 ('AIS-II','Assistant Intelligence Staff II',5,2),
-- 	 ('AIS-III','Assistant Intelligence Staff III',4,2),
-- 	 ('AAIS-IV','Assistant Intelligence Staff IV',3,2);
	
-- INSERT INTO flask.`rank` (name,description,`level`,cadre_id) VALUES
-- 	 ('CIO','Chief Intelligence Officer',14,3),
-- 	 ('ACIO','Assistant Chief Intelligence Officer',13,3),
-- 	 ('PIO','Principal Intelligence Officer',12,3),
-- 	 ('SIO','Senior Intelligence Officer',10,3),
-- 	 ('IO-I','Intelligence Officer I',9,3),
-- 	 ('IO-II','Intelligence Officer II',8,3),
--      ('SIA','Senior Intelligence Assistant',7,3),
-- 	 ('AIS-I','Assistant Intelligence Staff I',6,3),
-- 	 ('AIS-II','Assistant Intelligence Staff II',5,3),
-- 	 ('AIS-III','Assistant Intelligence Staff III',4,3),
-- 	 ('AAIS-IV','Assistant Intelligence Staff IV',3,3);
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Director', 1, 17, 'Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Deputy Director', 2, 16, 'Deputy Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Assistant Director', 3, 15, 'Assistant Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Chief Intelligence Officer', 4, 14, 'CIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Assistant Chief Intelligence Officer', 5, 13, 'ACIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Principal Intelligence Officer', 6, 12, 'PIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Senior Intelligence Officer', 7, 10, 'SIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Intelligence Officer I', 8, 9, 'IO-I');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (1, NULL, 'Intelligence Officer II', 9, 8, 'IO-II');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Director', 10, 17, 'Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Deputy Director', 11, 16, 'Deputy Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Director', 12, 15, 'Assistant Director');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Chief Intelligence Officer', 13, 14, 'CIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Chief Intelligence Officer', 14, 13, 'ACIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Principal Intelligence Officer', 15, 12, 'PIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Senior Intelligence Officer', 16, 10, 'SIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Intelligence Staff I', 17, 9, 'IS-I');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Intelligence Staff II', 18, 8, 'IS-II');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Senior Intelligence Assistant', 19, 7, 'SIA');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Intelligence Staff I', 20, 6, 'AIS-I');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Intelligence Staff II', 21, 5, 'AIS-II');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Intelligence Staff III', 22, 4, 'AIS-III');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (2, NULL, 'Assistant Intelligence Staff IV', 23, 3, 'AAIS-IV');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Chief Intelligence Officer', 24, 14, 'CIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Assistant Chief Intelligence Officer', 25, 13, 'ACIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Principal Intelligence Officer', 26, 12, 'PIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Senior Intelligence Officer', 27, 10, 'SIO');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Intelligence Officer I', 28, 9, 'IO-I');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Intelligence Officer II', 29, 8, 'IO-II');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Senior Intelligence Assistant', 30, 7, 'SIA');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Assistant Intelligence Staff I', 31, 6, 'AIS-I');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Assistant Intelligence Staff II', 32, 5, 'AIS-II');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Assistant Intelligence Staff III', 33, 4, 'AIS-III');
insert into `rank` (`cadre_id`, `deleted_at`, `description`, `id`, `level`, `name`) values (3, NULL, 'Assistant Intelligence Staff IV', 34, 3, 'AAIS-IV');

/** Unit award **/
TRUNCATE table award;

INSERT INTO flask.`award` (name,description) VALUES
	 ('Gold Category','Gold Category'),
     ('Silver Category','Silver Category'),
     ('Bronze Category','Bronze Category'),
     ('Long Service Award','Long Service Award'),
     ('Innovation Award','Innovation Award'),
     ('Posthumous Award','Posthumous Award');

/** Sanction data **/
TRUNCATE table sanction;

INSERT INTO flask.`sanction` (name,description) VALUES
	 ('Over Speeding','Over Speeding'),
     ('Late Coming','Late Coming'),
     ('Insubordination','Insubordination');

SET FOREIGN_KEY_CHECKS=1;