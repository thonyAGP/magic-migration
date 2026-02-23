-- ============================================================================
-- VUE: vw_mecano_real
-- Description: Vue MECANO adaptee au schema reel de CSK0912
-- Base de donnees: CSK0912 sur LENOVO_LB2I\SQLEXPRESS
-- ============================================================================
-- Cette vue genere les donnees MECANO a partir des tables reelles:
-- - cafil009_dat (gm-complet)
-- - cafil012_dat (hebergement)
-- ============================================================================

USE CSK0912;
GO

-- ============================================================================
-- Vue source: jointure clients + hebergements
-- ============================================================================
CREATE OR ALTER VIEW dbo.vw_mecano_source_real
AS
SELECT
    -- Cle primaire
    gmc.gmc_societe                         AS societe,
    gmc.gmc_compte                          AS compte,
    gmc.gmc_filiation_compte                AS filiation,

    -- Informations client
    gmc.gmc_nom_complet                     AS nom,
    gmc.gmc_prenom_complet                  AS prenom,
    gmc.gmc_titre                           AS titre,
    gmc.gmc_numero_adherent                 AS numero_adherent,
    gmc.gmc_numero_dossier                  AS numero_dossier,
    gmc.gmc_date_naissance                  AS date_naissance,
    gmc.gmc_code_vente                      AS code_vente,
    gmc.gmc_code_nationalite                AS code_nationalite,
    gmc.gmc_pays_residence                  AS pays_residence,
    gmc.gmc_nbre_sejour_club                AS nb_sejours_club,
    gmc.gmc_nbre_sejour_vill                AS nb_sejours_village,
    gmc.gmc_code_fidelite                   AS code_fidelite,
    gmc.gmc_type_de_client                  AS type_client,
    gmc.gmc_liste_blanche                   AS liste_blanche,
    gmc.gmc_bebe                            AS bebe_gmc,

    -- Informations sejour
    heb.heb_date_debut                      AS date_arrivee,
    heb.heb_heure_debut                     AS heure_arrivee,
    heb.heb_date_fin                        AS date_depart,
    heb.heb_heure_fin                       AS heure_depart,
    heb.heb_nom_logement                    AS logement,
    heb.heb_code_logement                   AS code_logement,
    heb.heb_lieu_de_sejour                  AS lieu_sejour,
    heb.heb_type_hebergement                AS type_hebergement,
    heb.heb_code_sexe                       AS code_sexe,
    heb.heb_age                             AS age_char,
    heb.heb_age_num                         AS age_num,
    heb.heb_nationalite                     AS nationalite_sejour,
    heb.heb_statut_sejour                   AS statut_sejour,
    heb.heb_u_p_nb_occup                    AS nb_occupants,
    heb.heb_code_package                    AS code_package

FROM dbo.cafil009_dat gmc
INNER JOIN dbo.cafil012_dat heb
    ON heb.heb_societe = gmc.gmc_societe
    AND heb.heb_num_compte = gmc.gmc_compte
    AND heb.heb_filiation = gmc.gmc_filiation_compte
GO

-- ============================================================================
-- Vue de traitement: calculs et transformations
-- ============================================================================
CREATE OR ALTER VIEW dbo.vw_mecano_traitement_real
AS
WITH base AS (
    SELECT *,
        -- Calcul de l'age numerique
        CASE
            WHEN ISNUMERIC(age_num) = 1 THEN CAST(age_num AS INT)
            ELSE 0
        END AS age_calcule
    FROM dbo.vw_mecano_source_real
),
avec_qualite AS (
    SELECT *,
        -- Qualite basee sur l'age
        CASE
            WHEN age_calcule <= 2 THEN 'BB'
            WHEN age_calcule <= 12 THEN 'ENF'
            WHEN age_calcule <= 17 THEN 'ADO'
            ELSE 'ADU'
        END AS qualite,
        -- Libelle sexe
        CASE
            WHEN titre IN ('M.', 'Mr', 'Mr.', 'Hr.', 'Sr.') THEN 'Mr'
            WHEN titre IN ('Mme', 'Me', 'Mlle', 'Mrs.', 'Sra.') THEN 'Me'
            WHEN code_sexe = 'M' THEN 'Mr'
            WHEN code_sexe = 'F' THEN 'Me'
            ELSE ''
        END AS sexe_lib
    FROM base
)
SELECT
    societe,
    compte,
    filiation,
    nom,
    prenom,
    titre,
    sexe_lib,
    numero_adherent,
    numero_dossier,
    code_vente,
    date_arrivee,
    date_depart,
    logement,
    code_logement,
    lieu_sejour,
    nb_occupants,
    age_char,
    age_calcule,
    qualite,
    code_fidelite,
    liste_blanche,
    statut_sejour,
    -- Indicateur retour (fidelite presente)
    CASE WHEN code_fidelite IS NOT NULL AND code_fidelite <> '' THEN 'S' ELSE '' END AS retour,
    -- Indicateur bebe
    CASE WHEN qualite = 'BB' THEN 'BB' ELSE '' END AS bebe_ind
FROM avec_qualite
GO

-- ============================================================================
-- Vue finale format MECANO
-- ============================================================================
CREATE OR ALTER VIEW dbo.vw_mecano_ecran_real
AS
SELECT
    ROW_NUMBER() OVER (ORDER BY nom, prenom, filiation) AS sequence,
    societe,
    code_vente,
    sexe_lib AS sexe,
    nom,
    prenom,
    CAST(filiation AS VARCHAR(10)) AS numero,
    FORMAT(numero_adherent, '0000000000') AS numero_adherent_fmt,
    age_calcule AS age,
    '' AS num_accompagnant,
    '0' AS fil_accompagnant,
    '' AS seminaire,
    numero_dossier AS dossier,
    lieu_sejour,
    code_logement,
    nb_occupants,
    date_depart AS fin_sejour,
    '' AS circuit,
    retour AS bebe,  -- Note: dans le fichier Magic, cette colonne semble etre 'S' pour retour
    code_fidelite AS millesia,
    logement AS nom_logement,
    CAST(age_calcule AS VARCHAR(10)) AS age_num
FROM dbo.vw_mecano_traitement_real
GO

PRINT 'Vues MECANO reelles creees avec succes';
GO
