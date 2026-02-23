-- ============================================================================
-- TEST DES VUES SQL - Validation avec donnees de test
-- ============================================================================
-- Execute ce script apres avoir cree les tables et insere les donnees de test
-- ============================================================================

USE PMS_Test;
GO

PRINT '============================================================================';
PRINT 'TEST 1: Vue vw_mecano_source';
PRINT '============================================================================';
GO

-- Creer la vue source
CREATE OR ALTER VIEW dbo.vw_mecano_source
AS
SELECT
    gmc.gmc_societe                         AS societe,
    gmc.gmc_compte                          AS compte,
    gmc.gmc_filiation                       AS filiation,
    gmc.gmc_nom_complet                     AS nom,
    gmc.gmc_prenom_complet                  AS prenom,
    gmc.gmc_numero_adherent                 AS numero_adherent,
    gmc.gmc_date_naissance                  AS date_naissance,
    gmc.gmc_code_nationalite                AS code_nationalite,
    gmc.gmc_nationalite                     AS nationalite,
    gmc.gmc_piece_d_identite                AS passeport,
    gmc.gmc_pays_residence                  AS pays_residence,
    gmc.gmc_code_postal                     AS code_postal,
    gmc.gmc_ville                           AS ville,
    gmc.gmc_etat_province                   AS etat_province,
    gmc.gmc_num_dans_la_rue                 AS num_rue,
    gmc.gmc_nom_de_la_rue                   AS nom_rue,
    gmc.gmc_nbre_sejour_club                AS nb_sejours_club,
    gmc.gmc_nbre_sejour_vill                AS nb_sejours_village,
    gmc.gmc_code_fidelite                   AS code_fidelite,
    gmc.gmc_type_de_client                  AS type_client,
    heb.heb_date_debut                      AS date_arrivee,
    heb.heb_heure_debut                     AS heure_arrivee,
    heb.heb_date_fin                        AS date_depart,
    heb.heb_heure_fin                       AS heure_depart,
    heb.heb_nom_logement                    AS logement,
    heb.heb_code_logement                   AS code_logement,
    heb.heb_type_hebergement                AS type_hebergement,
    heb.heb_code_sexe                       AS code_sexe,
    heb.heb_age_num                         AS age,
    heb.heb_nationalite                     AS nationalite_sejour,
    heb.heb_statut_sejour                   AS statut_sejour,
    heb.heb_liberation_chambre              AS heure_liberation,
    heb.heb_code_package                    AS code_package,
    heb.heb_u_p_nb_occup                    AS nb_occupants,
    CASE
        WHEN heb.heb_age_num <= 2 THEN 'BB'
        WHEN heb.heb_age_num <= 12 THEN 'ENF'
        WHEN heb.heb_age_num <= 17 THEN 'ADO'
        ELSE 'ADU'
    END AS qualite,
    CASE
        WHEN heb.heb_u_p_nb_occup = '1' THEN 'Y'
        ELSE 'N'
    END AS single_yn
FROM dbo.gm_complet gmc
INNER JOIN dbo.hebergement heb
    ON heb.heb_societe = gmc.gmc_societe
    AND heb.heb_num_compte = gmc.gmc_compte
    AND heb.heb_filiation = gmc.gmc_filiation
WHERE heb.heb_statut_sejour IN ('PR', 'AR', 'CO');
GO

-- Test de la vue source
PRINT 'Resultats vw_mecano_source:';
SELECT
    societe, compte, filiation,
    nom, prenom, age, qualite,
    date_arrivee, date_depart,
    logement, code_logement,
    statut_sejour
FROM dbo.vw_mecano_source
ORDER BY date_arrivee, nom, prenom;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TEST 2: Vue vw_mecano_traitement';
PRINT '============================================================================';
GO

-- Creer la vue traitement
CREATE OR ALTER VIEW dbo.vw_mecano_traitement
AS
WITH
traitement_1 AS (
    SELECT
        src.*,
        ROW_NUMBER() OVER (
            PARTITION BY src.societe
            ORDER BY src.date_arrivee, src.nom, src.prenom
        ) AS sequence_temp,
        COUNT(*) OVER (
            PARTITION BY src.societe, src.compte
        ) AS nb_membres_groupe
    FROM dbo.vw_mecano_source src
),
traitement_2 AS (
    SELECT
        t1.*,
        CASE t1.code_sexe
            WHEN 'M' THEN 'M.'
            WHEN 'F' THEN 'Mme'
            WHEN 'E' THEN 'Enf'
            ELSE ''
        END AS libelle_sexe,
        CONCAT(
            CASE t1.code_sexe
                WHEN 'M' THEN 'M.'
                WHEN 'F' THEN 'Mme'
                ELSE ''
            END,
            ' ',
            t1.qualite
        ) AS qualite_complete,
        CASE
            WHEN t1.code_fidelite IS NOT NULL AND t1.code_fidelite <> '' THEN 'RET'
            ELSE ''
        END AS retour_circuit,
        t1.code_fidelite AS millesias,
        CASE
            WHEN t1.type_client = 'VIP' THEN 'LB'
            ELSE ''
        END AS liste_blanche
    FROM traitement_1 t1
),
traitement_3 AS (
    SELECT
        t2.*,
        CONCAT(
            t2.societe, ' ',
            FORMAT(t2.numero_adherent, '0000000000'), '-',
            t2.compte, '/',
            FORMAT(t2.filiation, '000')
        ) AS numero_adherent_format,
        CONCAT(t2.code_logement, ' ', t2.logement) AS logement_complet,
        CASE
            WHEN t2.age <= 2 THEN CONCAT(CAST(t2.age AS VARCHAR(10)), ' BB')
            ELSE CAST(t2.age AS VARCHAR(10))
        END AS age_affiche,
        CASE
            WHEN t2.age <= 2 THEN 'BB'
            ELSE ''
        END AS bebe
    FROM traitement_2 t2
)
SELECT * FROM traitement_3;
GO

-- Test de la vue traitement
PRINT 'Resultats vw_mecano_traitement:';
SELECT
    sequence_temp AS seq,
    nom, prenom,
    libelle_sexe AS sexe,
    qualite_complete AS qualite,
    age_affiche AS age,
    logement_complet AS logement,
    pays_residence AS pays,
    retour_circuit AS retour,
    millesias,
    liste_blanche AS LB,
    bebe,
    nb_membres_groupe AS grp
FROM dbo.vw_mecano_traitement
ORDER BY sequence_temp;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TEST 3: Vue vw_mecano_ecran (format final)';
PRINT '============================================================================';
GO

-- Creer la vue finale
CREATE OR ALTER VIEW dbo.vw_mecano_ecran
AS
SELECT
    t.societe                               AS txe_societe,
    SYSTEM_USER                             AS txe_user,
    t.sequence_temp                         AS txe_sequence,
    LEFT(t.nom, 15)                         AS txe_nom,
    LEFT(t.prenom, 9)                       AS txe_prenom,
    LEFT(t.libelle_sexe, 2)                 AS txe_sexe,
    LEFT(t.qualite_complete, 7)             AS txe_qualite,
    t.age                                   AS txe_age,
    LEFT(t.logement_complet, 13)            AS txe_logement,
    LEFT(t.pays_residence, 2)               AS txe_pays,
    t.numero_adherent_format                AS txe_numero_adherent,
    t.date_arrivee                          AS txe_date_arrivee,
    t.heure_arrivee                         AS txe_time_arrivee,
    t.date_depart                           AS txe_date_depart,
    t.heure_depart                          AS txe_time_depart,
    t.bebe                                  AS txe_bebe,
    t.millesias                             AS txe_millesias,
    t.liste_blanche                         AS txe_liste_blanche,
    t.retour_circuit                        AS txe_retour_circuit,
    t.compte                                AS txe_compte,
    t.filiation                             AS txe_filiation,
    NULL                                    AS txe_telephone_int,
    t.ville                                 AS txe_telext___commune,
    t.code_postal                           AS txe_fax______burpost,
    ''                                      AS txe_type_ecran__cp,
    t.etat_province                         AS txe_etat_province,
    t.num_rue                               AS txe_num_rue,
    t.nom_rue                               AS txe_nom_rue,
    t.single_yn                             AS txe_single_y_n,
    t.code_logement                         AS txe_code_logement,
    CONCAT(t.compte, '/', t.filiation)      AS txe_dossier_na,
    ''                                      AS txe_nom_seminaire,
    ''                                      AS txe_comment_01,
    ''                                      AS txe_comment_02,
    ''                                      AS txe_comment_03,
    ''                                      AS txe_comment_04,
    ''                                      AS txe_comment_05,
    ''                                      AS txe_prestation_01,
    ''                                      AS txe_prestation_02,
    ''                                      AS txe_prestation_03,
    ''                                      AS txe_prestation_04,
    ''                                      AS txe_prestation_05,
    ''                                      AS txe_prestation_06,
    ''                                      AS txe_prestation_07,
    ''                                      AS txe_prestation_08,
    ''                                      AS txe_prestation_09,
    ''                                      AS txe_prestation_10,
    ''                                      AS txe_nom_filiation_0,
    ''                                      AS txe_prenom_filiation_0,
    t.date_naissance                        AS txe_date_naissance,
    t.passeport                             AS txe_passeport,
    t.nationalite                           AS txe_nationalite,
    ''                                      AS txe_email,
    t.heure_liberation                      AS txe_heure_liberation,
    ''                                      AS txe_compte_solde
FROM dbo.vw_mecano_traitement t;
GO

-- Test de la vue finale
PRINT 'Resultats vw_mecano_ecran (format tempo_ecran_mecano):';
SELECT
    txe_sequence AS [Seq],
    txe_nom AS [Nom],
    txe_prenom AS [Prenom],
    txe_sexe AS [Sx],
    txe_qualite AS [Qualite],
    txe_age AS [Age],
    txe_logement AS [Logement],
    txe_pays AS [Pays],
    FORMAT(txe_date_arrivee, 'dd/MM') AS [Arr],
    FORMAT(txe_date_depart, 'dd/MM') AS [Dep],
    txe_bebe AS [BB],
    txe_millesias AS [Fidel],
    txe_liste_blanche AS [LB],
    txe_retour_circuit AS [Ret]
FROM dbo.vw_mecano_ecran
ORDER BY txe_sequence;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TEST 4: Procedure stockee sp_mecano_generer';
PRINT '============================================================================';
GO

-- Creer la procedure stockee
CREATE OR ALTER PROCEDURE dbo.sp_mecano_generer
    @p_societe          NVARCHAR(2),
    @p_date_debut       DATE,
    @p_date_fin         DATE,
    @p_categorie        NVARCHAR(8)     = NULL,
    @p_sejour           NVARCHAR(1)     = NULL,
    @p_seminaire        NVARCHAR(20)    = NULL,
    @p_tri              NVARCHAR(1)     = 'N',
    @p_filtre_fidelite  BIT             = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_user NVARCHAR(20) = SYSTEM_USER;
    DECLARE @v_count INT = 0;

    -- Reset table temporaire
    DELETE FROM dbo.tempo_ecran_mecano
    WHERE txe_societe = @p_societe
      AND txe_user = @v_user;

    -- Insertion des donnees
    WITH source_data AS (
        SELECT
            gmc.gmc_societe,
            gmc.gmc_compte,
            gmc.gmc_filiation,
            gmc.gmc_nom_complet,
            gmc.gmc_prenom_complet,
            gmc.gmc_numero_adherent,
            gmc.gmc_date_naissance,
            gmc.gmc_nationalite,
            gmc.gmc_piece_d_identite,
            gmc.gmc_pays_residence,
            gmc.gmc_code_postal,
            gmc.gmc_ville,
            gmc.gmc_etat_province,
            gmc.gmc_num_dans_la_rue,
            gmc.gmc_nom_de_la_rue,
            gmc.gmc_code_fidelite,
            gmc.gmc_type_de_client,
            heb.heb_date_debut,
            heb.heb_heure_debut,
            heb.heb_date_fin,
            heb.heb_heure_fin,
            heb.heb_nom_logement,
            heb.heb_code_logement,
            heb.heb_code_sexe,
            heb.heb_age_num,
            heb.heb_u_p_nb_occup,
            heb.heb_liberation_chambre
        FROM dbo.gm_complet gmc
        INNER JOIN dbo.hebergement heb
            ON heb.heb_societe = gmc.gmc_societe
            AND heb.heb_num_compte = gmc.gmc_compte
            AND heb.heb_filiation = gmc.gmc_filiation
        WHERE gmc.gmc_societe = @p_societe
          AND heb.heb_statut_sejour IN ('PR', 'AR', 'CO')
          AND heb.heb_date_debut <= @p_date_fin
          AND heb.heb_date_fin >= @p_date_debut
          AND (@p_categorie IS NULL OR gmc.gmc_type_de_client = @p_categorie)
          AND (@p_filtre_fidelite = 0 OR gmc.gmc_code_fidelite IS NOT NULL)
    ),
    traitement AS (
        SELECT
            sd.*,
            ROW_NUMBER() OVER (
                ORDER BY
                    CASE @p_tri
                        WHEN 'N' THEN sd.gmc_nom_complet
                        ELSE CAST(sd.gmc_compte AS VARCHAR(20))
                    END,
                    sd.gmc_nom_complet,
                    sd.gmc_prenom_complet
            ) AS sequence,
            CASE sd.heb_code_sexe
                WHEN 'M' THEN 'M.'
                WHEN 'F' THEN 'Mme'
                ELSE ''
            END AS libelle_sexe,
            CASE
                WHEN sd.heb_age_num <= 2 THEN 'BB'
                WHEN sd.heb_age_num <= 12 THEN 'ENF'
                WHEN sd.heb_age_num <= 17 THEN 'ADO'
                ELSE 'ADU'
            END AS qualite,
            CASE WHEN sd.gmc_code_fidelite IS NOT NULL THEN 'RET' ELSE '' END AS retour,
            CASE WHEN sd.heb_age_num <= 2 THEN 'BB' ELSE '' END AS bebe,
            CASE WHEN sd.heb_u_p_nb_occup = '1' THEN 'Y' ELSE 'N' END AS single_yn
        FROM source_data sd
    )
    INSERT INTO dbo.tempo_ecran_mecano (
        txe_societe, txe_user, txe_sequence,
        txe_nom, txe_prenom, txe_sexe, txe_qualite, txe_age,
        txe_logement, txe_pays, txe_numero_adherent,
        txe_date_arrivee, txe_time_arrivee, txe_date_depart, txe_time_depart,
        txe_bebe, txe_millesias, txe_liste_blanche, txe_retour_circuit,
        txe_compte, txe_filiation,
        txe_telext___commune, txe_fax______burpost, txe_etat_province,
        txe_num_rue, txe_nom_rue,
        txe_single_y_n, txe_code_logement, txe_dossier_na,
        txe_date_naissance, txe_passeport, txe_nationalite, txe_heure_liberation
    )
    SELECT
        t.gmc_societe,
        @v_user,
        t.sequence,
        LEFT(t.gmc_nom_complet, 15),
        LEFT(t.gmc_prenom_complet, 9),
        LEFT(t.libelle_sexe, 2),
        CONCAT(t.libelle_sexe, ' ', t.qualite),
        t.heb_age_num,
        CONCAT(t.heb_code_logement, ' ', LEFT(t.heb_nom_logement, 7)),
        LEFT(t.gmc_pays_residence, 2),
        CONCAT(t.gmc_societe, ' ', FORMAT(t.gmc_numero_adherent, '0000000000'), '-',
               t.gmc_compte, '/', FORMAT(t.gmc_filiation, '000')),
        t.heb_date_debut,
        t.heb_heure_debut,
        t.heb_date_fin,
        t.heb_heure_fin,
        t.bebe,
        t.gmc_code_fidelite,
        CASE WHEN t.gmc_type_de_client = 'VIP' THEN 'LB' ELSE '' END,
        t.retour,
        t.gmc_compte,
        t.gmc_filiation,
        t.gmc_ville,
        t.gmc_code_postal,
        t.gmc_etat_province,
        t.gmc_num_dans_la_rue,
        t.gmc_nom_de_la_rue,
        t.single_yn,
        t.heb_code_logement,
        CONCAT(t.gmc_compte, '/', t.gmc_filiation),
        t.gmc_date_naissance,
        t.gmc_piece_d_identite,
        t.gmc_nationalite,
        t.heb_liberation_chambre
    FROM traitement t;

    SET @v_count = @@ROWCOUNT;

    SELECT
        @v_count AS nb_enregistrements,
        @p_societe AS societe,
        @p_date_debut AS date_debut,
        @p_date_fin AS date_fin,
        @p_tri AS tri_applique;
END
GO

-- Test de la procedure stockee
PRINT 'Execution de sp_mecano_generer pour Janvier 2024:';
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_tri = 'N';
GO

PRINT '';
PRINT 'Contenu de tempo_ecran_mecano apres execution:';
SELECT
    txe_sequence AS [Seq],
    txe_nom AS [Nom],
    txe_prenom AS [Prenom],
    txe_sexe AS [Sx],
    txe_qualite AS [Qualite],
    txe_age AS [Age],
    txe_logement AS [Logement],
    txe_pays AS [Pays],
    FORMAT(txe_date_arrivee, 'dd/MM') AS [Arr],
    FORMAT(txe_date_depart, 'dd/MM') AS [Dep],
    txe_bebe AS [BB],
    txe_millesias AS [Fidel],
    txe_liste_blanche AS [LB],
    txe_retour_circuit AS [Ret],
    txe_dossier_na AS [Dossier]
FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM'
ORDER BY txe_sequence;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TEST 5: Filtres specifiques';
PRINT '============================================================================';
GO

-- Test avec filtre VIP uniquement
PRINT 'Test filtre VIP:';
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_categorie = 'VIP',
    @p_tri = 'N';

SELECT txe_nom, txe_prenom, txe_liste_blanche
FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM';
GO

-- Test avec filtre fidelite uniquement
PRINT '';
PRINT 'Test filtre fidelite:';
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_filtre_fidelite = 1,
    @p_tri = 'N';

SELECT txe_nom, txe_prenom, txe_millesias, txe_retour_circuit
FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM';
GO

-- Test tri par dossier
PRINT '';
PRINT 'Test tri par dossier:';
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_tri = 'D';

SELECT txe_sequence, txe_dossier_na, txe_nom, txe_prenom
FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM'
ORDER BY txe_sequence;
GO

PRINT '';
PRINT '============================================================================';
PRINT 'TESTS TERMINES AVEC SUCCES';
PRINT '============================================================================';
GO
