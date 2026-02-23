-- ============================================================================
-- SCRIPT CONSOLIDE - Execution complete des tests MECANO
-- ============================================================================
-- Executer ce script dans SQL Server Management Studio (SSMS)
-- Il cree la base, les tables, insere les donnees et execute les tests
-- ============================================================================

PRINT '============================================================================';
PRINT 'MIGRATION MECANO - Script de test complet';
PRINT 'Date: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '============================================================================';
PRINT '';
GO

-- ============================================================================
-- PARTIE 1: Creation de la base de test
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PMS_Test')
BEGIN
    CREATE DATABASE PMS_Test;
    PRINT 'Base PMS_Test creee.';
END
ELSE
BEGIN
    PRINT 'Base PMS_Test existe deja.';
END
GO

USE PMS_Test;
GO

-- ============================================================================
-- PARTIE 2: Creation des tables
-- ============================================================================
PRINT '';
PRINT '=== Creation des tables ===';

IF OBJECT_ID('dbo.tempo_ecran_mecano', 'U') IS NOT NULL DROP TABLE dbo.tempo_ecran_mecano;
IF OBJECT_ID('dbo.hebergement', 'U') IS NOT NULL DROP TABLE dbo.hebergement;
IF OBJECT_ID('dbo.gm_complet', 'U') IS NOT NULL DROP TABLE dbo.gm_complet;
GO

CREATE TABLE dbo.gm_complet (
    gmc_societe NVARCHAR(2) NOT NULL, gmc_compte INT NOT NULL, gmc_filiation INT NOT NULL,
    gmc_titre NVARCHAR(10), gmc_nom_complet NVARCHAR(50) NOT NULL, gmc_prenom_complet NVARCHAR(50),
    gmc_type_de_client NVARCHAR(2), gmc_numero_adherent INT, gmc_filiation_club INT,
    gmc_date_naissance DATE, gmc_ville_naissance NVARCHAR(50), gmc_pays_naissance NVARCHAR(4),
    gmc_code_nationalite NVARCHAR(4), gmc_profession NVARCHAR(50), gmc_piece_d_identite NVARCHAR(30),
    gmc_date_delivrance DATE, gmc_date_validite DATE, gmc_ville_delivrance NVARCHAR(50),
    gmc_pays_delivrance NVARCHAR(4), gmc_nom_commune NVARCHAR(50), gmc_code_postal NVARCHAR(10),
    gmc_ville NVARCHAR(50), gmc_etat_province NVARCHAR(50), gmc_pays_residence NVARCHAR(4),
    gmc_num_dans_la_rue NVARCHAR(10), gmc_nom_de_la_rue NVARCHAR(100), gmc_nationalite NVARCHAR(50),
    gmc_nbre_sejour_club INT, gmc_nbre_sejour_vill INT, gmc_code_fidelite NVARCHAR(10),
    CONSTRAINT PK_gm_complet PRIMARY KEY (gmc_societe, gmc_compte, gmc_filiation)
);

CREATE TABLE dbo.hebergement (
    heb_societe NVARCHAR(2) NOT NULL, heb_num_compte INT NOT NULL, heb_filiation INT NOT NULL,
    heb_code_package NVARCHAR(10), heb_statut_sejour NVARCHAR(2) NOT NULL,
    heb_date_debut DATE NOT NULL, heb_heure_debut NVARCHAR(6), heb_date_fin DATE NOT NULL, heb_heure_fin NVARCHAR(6),
    heb_u_p_nb_occup NVARCHAR(4), heb_type_hebergement NVARCHAR(4), heb_complement_type NVARCHAR(4),
    heb_libelle NVARCHAR(50), heb_age NVARCHAR(4), heb_nationalite NVARCHAR(4),
    heb_nom_logement NVARCHAR(20), heb_code_sexe NVARCHAR(2), heb_latecheckout NVARCHAR(2),
    heb_lieu_de_sejour NVARCHAR(10), heb_code_logement NVARCHAR(10), heb_compactage NVARCHAR(2),
    heb_age_num INT, heb_age_nb_mois INT, heb_affec_auto NVARCHAR(2),
    heb_affec_comment NVARCHAR(100), heb_old_logement NVARCHAR(20), heb_liberation_chambre TIME,
    CONSTRAINT PK_hebergement PRIMARY KEY (heb_societe, heb_num_compte, heb_filiation, heb_date_debut)
);

CREATE TABLE dbo.tempo_ecran_mecano (
    txe_societe NVARCHAR(2) NOT NULL, txe_user NVARCHAR(20) NOT NULL, txe_sequence INT NOT NULL,
    txe_nom NVARCHAR(30), txe_prenom NVARCHAR(20), txe_sexe NVARCHAR(4), txe_qualite NVARCHAR(14),
    txe_age INT, txe_logement NVARCHAR(26), txe_pays NVARCHAR(4), txe_numero_adherent NVARCHAR(30),
    txe_date_arrivee DATE, txe_time_arrivee NVARCHAR(12), txe_date_depart DATE, txe_time_depart NVARCHAR(12),
    txe_bebe NVARCHAR(4), txe_millesias NVARCHAR(10), txe_liste_blanche NVARCHAR(4), txe_retour_circuit NVARCHAR(10),
    txe_compte INT, txe_filiation INT, txe_telephone_int INT, txe_telext___commune NVARCHAR(50),
    txe_fax______burpost NVARCHAR(50), txe_type_ecran__cp NVARCHAR(10), txe_etat_province NVARCHAR(50),
    txe_num_rue NVARCHAR(10), txe_nom_rue NVARCHAR(100), txe_single_y_n NVARCHAR(2),
    txe_code_logement NVARCHAR(10), txe_dossier_na NVARCHAR(20), txe_nom_seminaire NVARCHAR(50),
    txe_comment_01 NVARCHAR(100), txe_comment_02 NVARCHAR(100), txe_comment_03 NVARCHAR(100),
    txe_comment_04 NVARCHAR(100), txe_comment_05 NVARCHAR(100),
    txe_prestation_01 NVARCHAR(50), txe_prestation_02 NVARCHAR(50), txe_prestation_03 NVARCHAR(50),
    txe_prestation_04 NVARCHAR(50), txe_prestation_05 NVARCHAR(50), txe_prestation_06 NVARCHAR(50),
    txe_prestation_07 NVARCHAR(50), txe_prestation_08 NVARCHAR(50), txe_prestation_09 NVARCHAR(50),
    txe_prestation_10 NVARCHAR(50), txe_nom_filiation_0 VARCHAR(50), txe_prenom_filiation_0 VARCHAR(50),
    txe_date_naissance DATE, txe_passeport NVARCHAR(30), txe_nationalite NVARCHAR(50),
    txe_email NVARCHAR(100), txe_heure_liberation TIME, txe_compte_solde NVARCHAR(20),
    CONSTRAINT PK_tempo_ecran_mecano PRIMARY KEY (txe_societe, txe_user, txe_sequence)
);

PRINT 'Tables creees.';
GO

-- ============================================================================
-- PARTIE 3: Insertion des donnees de test
-- ============================================================================
PRINT '';
PRINT '=== Insertion des donnees de test ===';

-- Famille DUPONT (4 personnes) - Fidelite GOLD
INSERT INTO dbo.gm_complet VALUES
('CM',1001,0,'M.','DUPONT','Jean','ST',12345678,1,'1975-03-15','Paris','FR','FR','Ingenieur','AB123456','2020-01-15','2030-01-15','Paris','FR','Paris','75001','Paris','Ile-de-France','FR','12','Rue de la Paix','Francaise',5,3,'GOLD'),
('CM',1001,1,'Mme','DUPONT','Marie','ST',12345679,1,'1978-07-22','Lyon','FR','FR','Medecin','AB123457','2020-01-15','2030-01-15','Lyon','FR','Paris','75001','Paris','Ile-de-France','FR','12','Rue de la Paix','Francaise',5,3,'GOLD'),
('CM',1001,2,NULL,'DUPONT','Lucas','ST',12345680,1,'2010-09-10','Paris','FR','FR',NULL,NULL,NULL,NULL,NULL,NULL,'Paris','75001','Paris','Ile-de-France','FR','12','Rue de la Paix','Francaise',3,2,NULL),
('CM',1001,3,NULL,'DUPONT','Emma','ST',12345681,1,'2022-02-14','Paris','FR','FR',NULL,NULL,NULL,NULL,NULL,NULL,'Paris','75001','Paris','Ile-de-France','FR','12','Rue de la Paix','Francaise',1,1,NULL);

-- Couple MARTIN VIP (2 personnes) - Fidelite PLAT
INSERT INTO dbo.gm_complet VALUES
('CM',1002,0,'M.','MARTIN','Pierre','VIP',22345678,2,'1965-11-30','Bordeaux','FR','FR','Directeur','CD789012','2019-05-20','2029-05-20','Bordeaux','FR','Bordeaux','33000','Bordeaux','Nouvelle-Aquitaine','FR','45','Avenue des Vignes','Francaise',12,8,'PLAT'),
('CM',1002,1,'Mme','MARTIN','Sophie','VIP',22345679,2,'1968-04-18','Toulouse','FR','FR','Avocate','CD789013','2019-05-20','2029-05-20','Toulouse','FR','Bordeaux','33000','Bordeaux','Nouvelle-Aquitaine','FR','45','Avenue des Vignes','Francaise',12,8,'PLAT');

-- Famille GARCIA Espagne (3 personnes)
INSERT INTO dbo.gm_complet VALUES
('CM',1003,0,'Sr.','GARCIA','Carlos','ST',32345678,3,'1980-08-05','Madrid','ES','ES','Architecte','ES123456','2021-03-10','2031-03-10','Madrid','ES','Madrid','28001','Madrid','Madrid','ES','23','Calle Mayor','Espagnole',2,1,NULL),
('CM',1003,1,'Sra.','GARCIA','Ana','ST',32345679,3,'1982-12-20','Barcelona','ES','ES','Designer','ES123457','2021-03-10','2031-03-10','Barcelona','ES','Madrid','28001','Madrid','Madrid','ES','23','Calle Mayor','Espagnole',2,1,NULL),
('CM',1003,2,NULL,'GARCIA','Pablo','ST',32345680,3,'2015-06-25','Madrid','ES','ES',NULL,NULL,NULL,NULL,NULL,NULL,'Madrid','28001','Madrid','Madrid','ES','23','Calle Mayor','Espagnole',1,1,NULL);

-- Single MUELLER Allemand
INSERT INTO dbo.gm_complet VALUES
('CM',1004,0,'Hr.','MUELLER','Hans','ST',42345678,4,'1990-01-12','Berlin','DE','DE','Consultant','DE987654','2022-06-01','2032-06-01','Berlin','DE','Berlin','10115','Berlin','Berlin','DE','8','Unter den Linden','Allemande',1,0,NULL);

-- Famille JOHNSON USA (5 personnes avec bebe)
INSERT INTO dbo.gm_complet VALUES
('CM',1005,0,'Mr.','JOHNSON','Michael','ST',52345678,5,'1972-04-08','New York','US','US','Banker','US555666','2023-01-15','2033-01-15','New York','US','New York','10001','New York','New York','US','350','5th Avenue','Americaine',1,0,NULL),
('CM',1005,1,'Mrs.','JOHNSON','Sarah','ST',52345679,5,'1975-09-30','Boston','US','US','Professor','US555667','2023-01-15','2033-01-15','Boston','US','New York','10001','New York','New York','US','350','5th Avenue','Americaine',1,0,NULL),
('CM',1005,2,NULL,'JOHNSON','Emily','ST',52345680,5,'2005-11-22','New York','US','US',NULL,NULL,NULL,NULL,NULL,NULL,'New York','10001','New York','New York','US','350','5th Avenue','Americaine',1,0,NULL),
('CM',1005,3,NULL,'JOHNSON','James','ST',52345681,5,'2008-03-17','New York','US','US',NULL,NULL,NULL,NULL,NULL,NULL,'New York','10001','New York','New York','US','350','5th Avenue','Americaine',1,0,NULL),
('CM',1005,4,NULL,'JOHNSON','Baby','ST',52345682,5,'2023-06-01','New York','US','US',NULL,NULL,NULL,NULL,NULL,NULL,'New York','10001','New York','New York','US','350','5th Avenue','Americaine',1,0,NULL);

-- Hebergements
INSERT INTO dbo.hebergement VALUES
('CM',1001,0,'FAM4','PR','2024-01-06','14:00','2024-01-13','10:00','4','BGL','STD','Bungalow Standard','48','FR','Bungalow 12','M','N','PLAGE','B12','N',48,NULL,'Y',NULL,NULL,'10:00'),
('CM',1001,1,'FAM4','PR','2024-01-06','14:00','2024-01-13','10:00','4','BGL','STD','Bungalow Standard','45','FR','Bungalow 12','F','N','PLAGE','B12','N',45,NULL,'Y',NULL,NULL,'10:00'),
('CM',1001,2,'FAM4','PR','2024-01-06','14:00','2024-01-13','10:00','4','BGL','STD','Bungalow Standard','13','FR','Bungalow 12','M','N','PLAGE','B12','N',13,NULL,'Y',NULL,NULL,'10:00'),
('CM',1001,3,'FAM4','PR','2024-01-06','14:00','2024-01-13','10:00','4','BGL','STD','Bungalow Standard','1','FR','Bungalow 12','F','N','PLAGE','B12','N',1,NULL,'Y',NULL,NULL,'10:00'),
('CM',1002,0,'CPL2','PR','2024-01-08','12:00','2024-01-15','11:00','2','STE','LUX','Suite Luxe','58','FR','Suite 05','M','Y','GOLF','S05','N',58,NULL,'Y','VIP',NULL,'11:00'),
('CM',1002,1,'CPL2','PR','2024-01-08','12:00','2024-01-15','11:00','2','STE','LUX','Suite Luxe','55','FR','Suite 05','F','Y','GOLF','S05','N',55,NULL,'Y','VIP',NULL,'11:00'),
('CM',1003,0,'FAM3','AR','2024-01-10','15:00','2024-01-17','10:00','3','CHB','FAM','Chambre Familiale','43','ES','Chambre 22','M','N','PISCINE','C22','N',43,NULL,'Y',NULL,NULL,'10:00'),
('CM',1003,1,'FAM3','AR','2024-01-10','15:00','2024-01-17','10:00','3','CHB','FAM','Chambre Familiale','41','ES','Chambre 22','F','N','PISCINE','C22','N',41,NULL,'Y',NULL,NULL,'10:00'),
('CM',1003,2,'FAM3','AR','2024-01-10','15:00','2024-01-17','10:00','3','CHB','FAM','Chambre Familiale','8','ES','Chambre 22','M','N','PISCINE','C22','N',8,NULL,'Y',NULL,NULL,'10:00'),
('CM',1004,0,'SGL1','PR','2024-01-05','16:00','2024-01-12','10:00','1','CHB','STD','Chambre Standard','33','DE','Chambre 08','M','N','CENTRE','C08','N',33,NULL,'N',NULL,NULL,'10:00'),
('CM',1005,0,'FAM5','CO','2024-01-12','14:00','2024-01-20','10:00','5','VIL','PRE','Villa Premium','51','US','Villa 03','M','N','PLAGE','V03','N',51,NULL,'Y',NULL,NULL,'10:00'),
('CM',1005,1,'FAM5','CO','2024-01-12','14:00','2024-01-20','10:00','5','VIL','PRE','Villa Premium','48','US','Villa 03','F','N','PLAGE','V03','N',48,NULL,'Y',NULL,NULL,'10:00'),
('CM',1005,2,'FAM5','CO','2024-01-12','14:00','2024-01-20','10:00','5','VIL','PRE','Villa Premium','18','US','Villa 03','F','N','PLAGE','V03','N',18,NULL,'Y',NULL,NULL,'10:00'),
('CM',1005,3,'FAM5','CO','2024-01-12','14:00','2024-01-20','10:00','5','VIL','PRE','Villa Premium','15','US','Villa 03','M','N','PLAGE','V03','N',15,NULL,'Y',NULL,NULL,'10:00'),
('CM',1005,4,'FAM5','CO','2024-01-12','14:00','2024-01-20','10:00','5','VIL','PRE','Villa Premium','0','US','Villa 03','M','N','PLAGE','V03','N',0,6,'Y','Bebe 6 mois',NULL,'10:00');

PRINT 'Donnees inserees: ' + CAST((SELECT COUNT(*) FROM dbo.gm_complet) AS VARCHAR) + ' clients, ' +
      CAST((SELECT COUNT(*) FROM dbo.hebergement) AS VARCHAR) + ' hebergements';
GO

-- ============================================================================
-- PARTIE 4: Creation et test des vues
-- ============================================================================
PRINT '';
PRINT '=== Creation des vues ===';

-- Vue source
CREATE OR ALTER VIEW dbo.vw_mecano_source AS
SELECT gmc.gmc_societe AS societe, gmc.gmc_compte AS compte, gmc.gmc_filiation AS filiation,
    gmc.gmc_nom_complet AS nom, gmc.gmc_prenom_complet AS prenom, gmc.gmc_numero_adherent AS numero_adherent,
    gmc.gmc_date_naissance AS date_naissance, gmc.gmc_nationalite AS nationalite, gmc.gmc_piece_d_identite AS passeport,
    gmc.gmc_pays_residence AS pays_residence, gmc.gmc_code_postal AS code_postal, gmc.gmc_ville AS ville,
    gmc.gmc_etat_province AS etat_province, gmc.gmc_num_dans_la_rue AS num_rue, gmc.gmc_nom_de_la_rue AS nom_rue,
    gmc.gmc_code_fidelite AS code_fidelite, gmc.gmc_type_de_client AS type_client,
    heb.heb_date_debut AS date_arrivee, heb.heb_heure_debut AS heure_arrivee,
    heb.heb_date_fin AS date_depart, heb.heb_heure_fin AS heure_depart,
    heb.heb_nom_logement AS logement, heb.heb_code_logement AS code_logement,
    heb.heb_code_sexe AS code_sexe, heb.heb_age_num AS age, heb.heb_statut_sejour AS statut_sejour,
    heb.heb_liberation_chambre AS heure_liberation, heb.heb_u_p_nb_occup AS nb_occupants,
    CASE WHEN heb.heb_age_num<=2 THEN 'BB' WHEN heb.heb_age_num<=12 THEN 'ENF' WHEN heb.heb_age_num<=17 THEN 'ADO' ELSE 'ADU' END AS qualite,
    CASE WHEN heb.heb_u_p_nb_occup='1' THEN 'Y' ELSE 'N' END AS single_yn
FROM dbo.gm_complet gmc
INNER JOIN dbo.hebergement heb ON heb.heb_societe=gmc.gmc_societe AND heb.heb_num_compte=gmc.gmc_compte AND heb.heb_filiation=gmc.gmc_filiation
WHERE heb.heb_statut_sejour IN ('PR','AR','CO');
GO

-- Vue traitement
CREATE OR ALTER VIEW dbo.vw_mecano_traitement AS
WITH t1 AS (SELECT src.*, ROW_NUMBER() OVER (PARTITION BY src.societe ORDER BY src.date_arrivee,src.nom,src.prenom) AS sequence_temp,
    COUNT(*) OVER (PARTITION BY src.societe,src.compte) AS nb_membres_groupe FROM dbo.vw_mecano_source src),
t2 AS (SELECT t1.*, CASE t1.code_sexe WHEN 'M' THEN 'M.' WHEN 'F' THEN 'Mme' ELSE '' END AS libelle_sexe,
    CASE WHEN t1.code_fidelite IS NOT NULL AND t1.code_fidelite<>'' THEN 'RET' ELSE '' END AS retour_circuit,
    t1.code_fidelite AS millesias, CASE WHEN t1.type_client='VIP' THEN 'LB' ELSE '' END AS liste_blanche FROM t1),
t3 AS (SELECT t2.*, CONCAT(t2.libelle_sexe,' ',t2.qualite) AS qualite_complete,
    CONCAT(t2.societe,' ',FORMAT(t2.numero_adherent,'0000000000'),'-',t2.compte,'/',FORMAT(t2.filiation,'000')) AS numero_adherent_format,
    CONCAT(t2.code_logement,' ',t2.logement) AS logement_complet,
    CASE WHEN t2.age<=2 THEN 'BB' ELSE '' END AS bebe FROM t2)
SELECT * FROM t3;
GO

-- Vue ecran finale
CREATE OR ALTER VIEW dbo.vw_mecano_ecran AS
SELECT t.societe AS txe_societe, SYSTEM_USER AS txe_user, t.sequence_temp AS txe_sequence,
    LEFT(t.nom,15) AS txe_nom, LEFT(t.prenom,9) AS txe_prenom, LEFT(t.libelle_sexe,2) AS txe_sexe,
    LEFT(t.qualite_complete,7) AS txe_qualite, t.age AS txe_age, LEFT(t.logement_complet,13) AS txe_logement,
    LEFT(t.pays_residence,2) AS txe_pays, t.numero_adherent_format AS txe_numero_adherent,
    t.date_arrivee AS txe_date_arrivee, t.heure_arrivee AS txe_time_arrivee,
    t.date_depart AS txe_date_depart, t.heure_depart AS txe_time_depart,
    t.bebe AS txe_bebe, t.millesias AS txe_millesias, t.liste_blanche AS txe_liste_blanche,
    t.retour_circuit AS txe_retour_circuit, t.compte AS txe_compte, t.filiation AS txe_filiation,
    t.ville AS txe_telext___commune, t.code_postal AS txe_fax______burpost,
    t.etat_province AS txe_etat_province, t.num_rue AS txe_num_rue, t.nom_rue AS txe_nom_rue,
    t.single_yn AS txe_single_y_n, t.code_logement AS txe_code_logement,
    CONCAT(t.compte,'/',t.filiation) AS txe_dossier_na, t.date_naissance AS txe_date_naissance,
    t.passeport AS txe_passeport, t.nationalite AS txe_nationalite, t.heure_liberation AS txe_heure_liberation
FROM dbo.vw_mecano_traitement t;
GO

PRINT 'Vues creees.';
GO

-- ============================================================================
-- PARTIE 5: Affichage des resultats
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'RESULTATS DES TESTS';
PRINT '============================================================================';
PRINT '';

PRINT '--- Vue vw_mecano_ecran (format tempo_ecran_mecano) ---';
SELECT txe_sequence AS [Seq], txe_nom AS [Nom], txe_prenom AS [Prenom], txe_sexe AS [Sx],
    txe_qualite AS [Qualite], txe_age AS [Age], txe_logement AS [Logement], txe_pays AS [Pays],
    FORMAT(txe_date_arrivee,'dd/MM') AS [Arr], FORMAT(txe_date_depart,'dd/MM') AS [Dep],
    txe_bebe AS [BB], txe_millesias AS [Fidel], txe_liste_blanche AS [LB], txe_retour_circuit AS [Ret]
FROM dbo.vw_mecano_ecran ORDER BY txe_sequence;
GO

PRINT '';
PRINT '--- Statistiques ---';
SELECT 'Total personnes' AS [Indicateur], COUNT(*) AS [Valeur] FROM dbo.vw_mecano_ecran
UNION ALL SELECT 'Adultes', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_qualite LIKE '%ADU%'
UNION ALL SELECT 'Enfants', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_qualite LIKE '%ENF%'
UNION ALL SELECT 'Adolescents', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_qualite LIKE '%ADO%'
UNION ALL SELECT 'Bebes', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_bebe = 'BB'
UNION ALL SELECT 'VIP (Liste Blanche)', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_liste_blanche = 'LB'
UNION ALL SELECT 'Retour (Fidelite)', COUNT(*) FROM dbo.vw_mecano_ecran WHERE txe_retour_circuit = 'RET';
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TESTS TERMINES AVEC SUCCES';
PRINT '============================================================================';
GO
