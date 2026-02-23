-- ============================================================================
-- DONNEES DE TEST - Insertion de donnees fictives realistes
-- ============================================================================
-- Donnees simulant un village vacances avec differents types de clients
-- Periode de test: Janvier 2024
-- ============================================================================

USE PMS_Test;
GO

-- ============================================================================
-- CLIENTS (gm_complet)
-- ============================================================================
-- Dossier 1001: Famille DUPONT (4 personnes)
INSERT INTO dbo.gm_complet VALUES
('CM', 1001, 0, 'M.', 'DUPONT', 'Jean', 'ST', 12345678, 1, '1975-03-15', 'Paris', 'FR', 'FR', 'Ingenieur', 'AB123456', '2020-01-15', '2030-01-15', 'Paris', 'FR', 'Paris', '75001', 'Paris', 'Ile-de-France', 'FR', '12', 'Rue de la Paix', 'Francaise', 5, 3, 'GOLD'),
('CM', 1001, 1, 'Mme', 'DUPONT', 'Marie', 'ST', 12345679, 1, '1978-07-22', 'Lyon', 'FR', 'FR', 'Medecin', 'AB123457', '2020-01-15', '2030-01-15', 'Lyon', 'FR', 'Paris', '75001', 'Paris', 'Ile-de-France', 'FR', '12', 'Rue de la Paix', 'Francaise', 5, 3, 'GOLD'),
('CM', 1001, 2, NULL, 'DUPONT', 'Lucas', 'ST', 12345680, 1, '2010-09-10', 'Paris', 'FR', 'FR', NULL, NULL, NULL, NULL, NULL, NULL, 'Paris', '75001', 'Paris', 'Ile-de-France', 'FR', '12', 'Rue de la Paix', 'Francaise', 3, 2, NULL),
('CM', 1001, 3, NULL, 'DUPONT', 'Emma', 'ST', 12345681, 1, '2022-02-14', 'Paris', 'FR', 'FR', NULL, NULL, NULL, NULL, NULL, NULL, 'Paris', '75001', 'Paris', 'Ile-de-France', 'FR', '12', 'Rue de la Paix', 'Francaise', 1, 1, NULL);

-- Dossier 1002: Couple MARTIN (2 personnes) - VIP
INSERT INTO dbo.gm_complet VALUES
('CM', 1002, 0, 'M.', 'MARTIN', 'Pierre', 'VIP', 22345678, 2, '1965-11-30', 'Bordeaux', 'FR', 'FR', 'Directeur', 'CD789012', '2019-05-20', '2029-05-20', 'Bordeaux', 'FR', 'Bordeaux', '33000', 'Bordeaux', 'Nouvelle-Aquitaine', 'FR', '45', 'Avenue des Vignes', 'Francaise', 12, 8, 'PLAT'),
('CM', 1002, 1, 'Mme', 'MARTIN', 'Sophie', 'VIP', 22345679, 2, '1968-04-18', 'Toulouse', 'FR', 'FR', 'Avocate', 'CD789013', '2019-05-20', '2029-05-20', 'Toulouse', 'FR', 'Bordeaux', '33000', 'Bordeaux', 'Nouvelle-Aquitaine', 'FR', '45', 'Avenue des Vignes', 'Francaise', 12, 8, 'PLAT');

-- Dossier 1003: Famille GARCIA (3 personnes) - Espagnols
INSERT INTO dbo.gm_complet VALUES
('CM', 1003, 0, 'Sr.', 'GARCIA', 'Carlos', 'ST', 32345678, 3, '1980-08-05', 'Madrid', 'ES', 'ES', 'Architecte', 'ES123456', '2021-03-10', '2031-03-10', 'Madrid', 'ES', 'Madrid', '28001', 'Madrid', 'Madrid', 'ES', '23', 'Calle Mayor', 'Espagnole', 2, 1, NULL),
('CM', 1003, 1, 'Sra.', 'GARCIA', 'Ana', 'ST', 32345679, 3, '1982-12-20', 'Barcelona', 'ES', 'ES', 'Designer', 'ES123457', '2021-03-10', '2031-03-10', 'Barcelona', 'ES', 'Madrid', '28001', 'Madrid', 'Madrid', 'ES', '23', 'Calle Mayor', 'Espagnole', 2, 1, NULL),
('CM', 1003, 2, NULL, 'GARCIA', 'Pablo', 'ST', 32345680, 3, '2015-06-25', 'Madrid', 'ES', 'ES', NULL, NULL, NULL, NULL, NULL, NULL, 'Madrid', '28001', 'Madrid', 'Madrid', 'ES', '23', 'Calle Mayor', 'Espagnole', 1, 1, NULL);

-- Dossier 1004: Celibataire MUELLER - Allemand
INSERT INTO dbo.gm_complet VALUES
('CM', 1004, 0, 'Hr.', 'MUELLER', 'Hans', 'ST', 42345678, 4, '1990-01-12', 'Berlin', 'DE', 'DE', 'Consultant', 'DE987654', '2022-06-01', '2032-06-01', 'Berlin', 'DE', 'Berlin', '10115', 'Berlin', 'Berlin', 'DE', '8', 'Unter den Linden', 'Allemande', 1, 0, NULL);

-- Dossier 1005: Famille JOHNSON - Americains (5 personnes)
INSERT INTO dbo.gm_complet VALUES
('CM', 1005, 0, 'Mr.', 'JOHNSON', 'Michael', 'ST', 52345678, 5, '1972-04-08', 'New York', 'US', 'US', 'Banker', 'US555666', '2023-01-15', '2033-01-15', 'New York', 'US', 'New York', '10001', 'New York', 'New York', 'US', '350', '5th Avenue', 'Americaine', 1, 0, NULL),
('CM', 1005, 1, 'Mrs.', 'JOHNSON', 'Sarah', 'ST', 52345679, 5, '1975-09-30', 'Boston', 'US', 'US', 'Professor', 'US555667', '2023-01-15', '2033-01-15', 'Boston', 'US', 'New York', '10001', 'New York', 'New York', 'US', '350', '5th Avenue', 'Americaine', 1, 0, NULL),
('CM', 1005, 2, NULL, 'JOHNSON', 'Emily', 'ST', 52345680, 5, '2005-11-22', 'New York', 'US', 'US', NULL, NULL, NULL, NULL, NULL, NULL, 'New York', '10001', 'New York', 'New York', 'US', '350', '5th Avenue', 'Americaine', 1, 0, NULL),
('CM', 1005, 3, NULL, 'JOHNSON', 'James', 'ST', 52345681, 5, '2008-03-17', 'New York', 'US', 'US', NULL, NULL, NULL, NULL, NULL, NULL, 'New York', '10001', 'New York', 'New York', 'US', '350', '5th Avenue', 'Americaine', 1, 0, NULL),
('CM', 1005, 4, NULL, 'JOHNSON', 'Baby', 'ST', 52345682, 5, '2023-06-01', 'New York', 'US', 'US', NULL, NULL, NULL, NULL, NULL, NULL, 'New York', '10001', 'New York', 'New York', 'US', '350', '5th Avenue', 'Americaine', 1, 0, NULL);

PRINT 'Clients inseres: ' + CAST(@@ROWCOUNT AS VARCHAR(10));
GO

-- ============================================================================
-- HEBERGEMENTS (sejours)
-- ============================================================================
-- Famille DUPONT: 06-13 Janvier 2024 - Bungalow B12
INSERT INTO dbo.hebergement VALUES
('CM', 1001, 0, 'FAM4', 'PR', '2024-01-06', '14:00', '2024-01-13', '10:00', '4', 'BGL', 'STD', 'Bungalow Standard', '48', 'FR', 'Bungalow 12', 'M', 'N', 'PLAGE', 'B12', 'N', 48, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1001, 1, 'FAM4', 'PR', '2024-01-06', '14:00', '2024-01-13', '10:00', '4', 'BGL', 'STD', 'Bungalow Standard', '45', 'FR', 'Bungalow 12', 'F', 'N', 'PLAGE', 'B12', 'N', 45, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1001, 2, 'FAM4', 'PR', '2024-01-06', '14:00', '2024-01-13', '10:00', '4', 'BGL', 'STD', 'Bungalow Standard', '13', 'FR', 'Bungalow 12', 'M', 'N', 'PLAGE', 'B12', 'N', 13, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1001, 3, 'FAM4', 'PR', '2024-01-06', '14:00', '2024-01-13', '10:00', '4', 'BGL', 'STD', 'Bungalow Standard', '1', 'FR', 'Bungalow 12', 'F', 'N', 'PLAGE', 'B12', 'N', 1, NULL, 'Y', NULL, NULL, '10:00');

-- Couple MARTIN VIP: 08-15 Janvier 2024 - Suite S05
INSERT INTO dbo.hebergement VALUES
('CM', 1002, 0, 'CPL2', 'PR', '2024-01-08', '12:00', '2024-01-15', '11:00', '2', 'STE', 'LUX', 'Suite Luxe', '58', 'FR', 'Suite 05', 'M', 'Y', 'GOLF', 'S05', 'N', 58, NULL, 'Y', 'VIP - Late checkout', NULL, '11:00'),
('CM', 1002, 1, 'CPL2', 'PR', '2024-01-08', '12:00', '2024-01-15', '11:00', '2', 'STE', 'LUX', 'Suite Luxe', '55', 'FR', 'Suite 05', 'F', 'Y', 'GOLF', 'S05', 'N', 55, NULL, 'Y', 'VIP - Late checkout', NULL, '11:00');

-- Famille GARCIA: 10-17 Janvier 2024 - Chambre C22
INSERT INTO dbo.hebergement VALUES
('CM', 1003, 0, 'FAM3', 'AR', '2024-01-10', '15:00', '2024-01-17', '10:00', '3', 'CHB', 'FAM', 'Chambre Familiale', '43', 'ES', 'Chambre 22', 'M', 'N', 'PISCINE', 'C22', 'N', 43, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1003, 1, 'FAM3', 'AR', '2024-01-10', '15:00', '2024-01-17', '10:00', '3', 'CHB', 'FAM', 'Chambre Familiale', '41', 'ES', 'Chambre 22', 'F', 'N', 'PISCINE', 'C22', 'N', 41, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1003, 2, 'FAM3', 'AR', '2024-01-10', '15:00', '2024-01-17', '10:00', '3', 'CHB', 'FAM', 'Chambre Familiale', '8', 'ES', 'Chambre 22', 'M', 'N', 'PISCINE', 'C22', 'N', 8, NULL, 'Y', NULL, NULL, '10:00');

-- MUELLER single: 05-12 Janvier 2024 - Chambre C08
INSERT INTO dbo.hebergement VALUES
('CM', 1004, 0, 'SGL1', 'PR', '2024-01-05', '16:00', '2024-01-12', '10:00', '1', 'CHB', 'STD', 'Chambre Standard', '33', 'DE', 'Chambre 08', 'M', 'N', 'CENTRE', 'C08', 'N', 33, NULL, 'N', NULL, NULL, '10:00');

-- Famille JOHNSON: 12-20 Janvier 2024 - Villa V03
INSERT INTO dbo.hebergement VALUES
('CM', 1005, 0, 'FAM5', 'CO', '2024-01-12', '14:00', '2024-01-20', '10:00', '5', 'VIL', 'PRE', 'Villa Premium', '51', 'US', 'Villa 03', 'M', 'N', 'PLAGE', 'V03', 'N', 51, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1005, 1, 'FAM5', 'CO', '2024-01-12', '14:00', '2024-01-20', '10:00', '5', 'VIL', 'PRE', 'Villa Premium', '48', 'US', 'Villa 03', 'F', 'N', 'PLAGE', 'V03', 'N', 48, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1005, 2, 'FAM5', 'CO', '2024-01-12', '14:00', '2024-01-20', '10:00', '5', 'VIL', 'PRE', 'Villa Premium', '18', 'US', 'Villa 03', 'F', 'N', 'PLAGE', 'V03', 'N', 18, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1005, 3, 'FAM5', 'CO', '2024-01-12', '14:00', '2024-01-20', '10:00', '5', 'VIL', 'PRE', 'Villa Premium', '15', 'US', 'Villa 03', 'M', 'N', 'PLAGE', 'V03', 'N', 15, NULL, 'Y', NULL, NULL, '10:00'),
('CM', 1005, 4, 'FAM5', 'CO', '2024-01-12', '14:00', '2024-01-20', '10:00', '5', 'VIL', 'PRE', 'Villa Premium', '0', 'US', 'Villa 03', 'M', 'N', 'PLAGE', 'V03', 'N', 0, 6, 'Y', 'Bebe 6 mois', NULL, '10:00');

PRINT 'Hebergements inseres: ' + CAST(@@ROWCOUNT AS VARCHAR(10));
GO

-- ============================================================================
-- Verification des donnees inserees
-- ============================================================================
PRINT '';
PRINT '=== RESUME DES DONNEES DE TEST ===';
PRINT '';

SELECT 'Clients' AS [Table], COUNT(*) AS [Nb Enregistrements] FROM dbo.gm_complet
UNION ALL
SELECT 'Hebergements', COUNT(*) FROM dbo.hebergement;
GO

PRINT '';
PRINT 'Clients par dossier:';
SELECT
    gmc_compte AS Dossier,
    COUNT(*) AS NbPersonnes,
    MAX(gmc_nom_complet) AS NomFamille,
    MAX(gmc_pays_residence) AS Pays,
    MAX(gmc_code_fidelite) AS Fidelite
FROM dbo.gm_complet
GROUP BY gmc_compte
ORDER BY gmc_compte;
GO

PRINT '';
PRINT 'Sejours par periode:';
SELECT
    heb_num_compte AS Dossier,
    heb_date_debut AS Arrivee,
    heb_date_fin AS Depart,
    heb_nom_logement AS Logement,
    COUNT(*) AS NbPersonnes,
    heb_statut_sejour AS Statut
FROM dbo.hebergement
GROUP BY heb_num_compte, heb_date_debut, heb_date_fin, heb_nom_logement, heb_statut_sejour
ORDER BY heb_date_debut;
GO
