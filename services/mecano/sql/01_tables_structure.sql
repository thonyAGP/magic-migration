-- ============================================================================
-- MIGRATION MECANO - Structure des tables
-- Source: Magic Unipaas v12.03 (PBP/REF)
-- Cible: SQL Server
-- ============================================================================
-- Ce script documente la structure des tables impliquees dans le flux MECANO
-- ============================================================================

-- ============================================================================
-- TABLES SOURCES (REF - composant partage)
-- ============================================================================

-- Table 31: gm-complet (Donnees clients completes)
-- Fichier physique: cafil009_dat
/*
CREATE TABLE dbo.gm_complet (
    gmc_societe             NVARCHAR(2)     NOT NULL,
    gmc_compte              INT             NOT NULL,
    gmc_filiation           INT             NOT NULL,
    gmc_titre               NVARCHAR(10)    NULL,
    gmc_nom_complet         NVARCHAR(50)    NOT NULL,
    gmc_prenom_complet      NVARCHAR(50)    NULL,
    gmc_type_de_client      NVARCHAR(2)     NULL,
    gmc_numero_adherent     INT             NULL,
    gmc_filiation_club      INT             NULL,
    gmc_date_naissance      DATE            NULL,
    gmc_ville_naissance     NVARCHAR(50)    NULL,
    gmc_pays_naissance      NVARCHAR(4)     NULL,
    gmc_code_nationalite    NVARCHAR(4)     NULL,
    gmc_profession          NVARCHAR(50)    NULL,
    gmc_piece_d_identite    NVARCHAR(30)    NULL,
    gmc_date_delivrance     DATE            NULL,
    gmc_date_validite       DATE            NULL,
    gmc_ville_delivrance    NVARCHAR(50)    NULL,
    gmc_pays_delivrance     NVARCHAR(4)     NULL,
    gmc_nom_commune         NVARCHAR(50)    NULL,
    gmc_code_postal         NVARCHAR(10)    NULL,
    gmc_ville               NVARCHAR(50)    NULL,
    gmc_etat_province       NVARCHAR(50)    NULL,
    gmc_pays_residence      NVARCHAR(4)     NULL,
    gmc_num_dans_la_rue     NVARCHAR(10)    NULL,
    gmc_nom_de_la_rue       NVARCHAR(100)   NULL,
    gmc_nationalite         NVARCHAR(50)    NULL,
    gmc_nbre_sejour_club    INT             NULL,
    gmc_nbre_sejour_vill    INT             NULL,
    gmc_code_fidelite       NVARCHAR(10)    NULL,
    -- ... autres colonnes
    CONSTRAINT PK_gm_complet PRIMARY KEY (gmc_societe, gmc_compte, gmc_filiation)
);
*/

-- Table 34: hebergement (Sejours/Hebergements)
-- Fichier physique: cafil012_dat
/*
CREATE TABLE dbo.hebergement (
    heb_societe             NVARCHAR(2)     NOT NULL,
    heb_num_compte          INT             NOT NULL,
    heb_filiation           INT             NOT NULL,
    heb_code_package        NVARCHAR(10)    NULL,
    heb_statut_sejour       NVARCHAR(2)     NOT NULL,
    heb_date_debut          DATE            NOT NULL,
    heb_heure_debut         NVARCHAR(6)     NULL,
    heb_date_fin            DATE            NOT NULL,
    heb_heure_fin           NVARCHAR(6)     NULL,
    heb_u_p_nb_occup        NVARCHAR(4)     NULL,
    heb_type_hebergement    NVARCHAR(4)     NULL,
    heb_complement_type     NVARCHAR(4)     NULL,
    heb_libelle             NVARCHAR(50)    NULL,
    heb_age                 NVARCHAR(4)     NULL,
    heb_nationalite         NVARCHAR(4)     NULL,
    heb_nom_logement        NVARCHAR(20)    NULL,
    heb_code_sexe           NVARCHAR(2)     NULL,
    heb_latecheckout        NVARCHAR(2)     NULL,
    heb_lieu_de_sejour      NVARCHAR(10)    NULL,
    heb_code_logement       NVARCHAR(10)    NULL,
    heb_compactage          NVARCHAR(2)     NULL,
    heb_age_num             INT             NULL,
    heb_age_nb_mois         INT             NULL,
    heb_affec_auto          NVARCHAR(2)     NULL,
    heb_affec_comment       NVARCHAR(100)   NULL,
    heb_old_logement        NVARCHAR(20)    NULL,
    heb_liberation_chambre  TIME            NULL,
    -- ... autres colonnes
    CONSTRAINT PK_hebergement PRIMARY KEY (heb_societe, heb_num_compte, heb_filiation, heb_date_debut)
);
*/

-- ============================================================================
-- TABLES INTERMEDIAIRES MECANO
-- ============================================================================

-- Table 604: tempo_mecano_1__mec1 (Traitement Mecano 1)
-- Fichier physique: tmp_mec01_dat
/*
CREATE TABLE dbo.tempo_mecano_1 (
    mec1_societe            NVARCHAR(2)     NOT NULL,
    mec1_user               NVARCHAR(20)    NOT NULL,
    mec1_compte             INT             NOT NULL,
    mec1_filiation          INT             NOT NULL,
    -- Colonnes de traitement niveau 1
    CONSTRAINT PK_tempo_mecano_1 PRIMARY KEY (mec1_societe, mec1_user, mec1_compte, mec1_filiation)
);
*/

-- Table 605: tempo_mecano_2__mec2 (Traitement Mecano 2)
-- Fichier physique: tmp_mec02_dat
/*
CREATE TABLE dbo.tempo_mecano_2 (
    mec2_societe            NVARCHAR(2)     NOT NULL,
    mec2_user               NVARCHAR(20)    NOT NULL,
    mec2_compte             INT             NOT NULL,
    mec2_filiation          INT             NOT NULL,
    -- Colonnes de traitement niveau 2
    CONSTRAINT PK_tempo_mecano_2 PRIMARY KEY (mec2_societe, mec2_user, mec2_compte, mec2_filiation)
);
*/

-- Table 606: tempo_mecano_3_mec3 (Traitement Mecano 3)
-- Fichier physique: tmp_mec03_dat
-- Cette table est la SOURCE PRINCIPALE pour la creation du tempo_ecran_mecano
/*
CREATE TABLE dbo.tempo_mecano_3 (
    mec3_societe            NVARCHAR(2)     NOT NULL,
    mec3_user               NVARCHAR(20)    NOT NULL,
    mec3_compte             INT             NOT NULL,
    mec3_filiation          INT             NOT NULL,
    -- Colonnes de traitement niveau 3 (donnees agregees)
    CONSTRAINT PK_tempo_mecano_3 PRIMARY KEY (mec3_societe, mec3_user, mec3_compte, mec3_filiation)
);
*/

-- ============================================================================
-- TABLE DE SORTIE MECANO
-- ============================================================================

-- Table 594: tempo_ecran_mecano (Affichage final)
-- Fichier physique: tmp_ecrmec_dat
-- Cette table est remplie par Prg_666 (Creation tempo ecran generique)
/*
CREATE TABLE dbo.tempo_ecran_mecano (
    txe_societe             NVARCHAR(2)     NOT NULL,
    txe_user                NVARCHAR(20)    NOT NULL,
    txe_sequence            INT             NOT NULL,
    txe_nom                 NVARCHAR(30)    NOT NULL,
    txe_prenom              NVARCHAR(20)    NULL,
    txe_sexe                NVARCHAR(4)     NULL,
    txe_qualite             NVARCHAR(14)    NULL,
    txe_age                 INT             NULL,
    txe_logement            NVARCHAR(26)    NULL,
    txe_pays                NVARCHAR(4)     NULL,
    txe_numero_adherent     NVARCHAR(30)    NULL,
    txe_date_arrivee        DATE            NULL,
    txe_time_arrivee        NVARCHAR(12)    NULL,
    txe_date_depart         DATE            NULL,
    txe_time_depart         NVARCHAR(12)    NULL,
    txe_bebe                NVARCHAR(4)     NULL,
    txe_millesias           NVARCHAR(10)    NULL,
    txe_liste_blanche       NVARCHAR(4)     NULL,
    txe_retour_circuit      NVARCHAR(10)    NULL,
    txe_compte              INT             NULL,
    txe_filiation           INT             NULL,
    txe_telephone_int       INT             NULL,
    txe_telext___commune    NVARCHAR(50)    NULL,
    txe_fax______burpost    NVARCHAR(50)    NULL,
    txe_type_ecran__cp      NVARCHAR(10)    NULL,
    txe_etat_province       NVARCHAR(50)    NULL,
    txe_num_rue             NVARCHAR(10)    NULL,
    txe_nom_rue             NVARCHAR(100)   NULL,
    txe_single_y_n          NVARCHAR(2)     NULL,
    txe_code_logement       NVARCHAR(10)    NULL,
    txe_dossier_na          NVARCHAR(20)    NULL,
    txe_nom_seminaire       NVARCHAR(50)    NULL,
    txe_comment_01          NVARCHAR(100)   NULL,
    txe_comment_02          NVARCHAR(100)   NULL,
    txe_comment_03          NVARCHAR(100)   NULL,
    txe_comment_04          NVARCHAR(100)   NULL,
    txe_comment_05          NVARCHAR(100)   NULL,
    txe_prestation_01       NVARCHAR(50)    NULL,
    txe_prestation_02       NVARCHAR(50)    NULL,
    txe_prestation_03       NVARCHAR(50)    NULL,
    txe_prestation_04       NVARCHAR(50)    NULL,
    txe_prestation_05       NVARCHAR(50)    NULL,
    txe_prestation_06       NVARCHAR(50)    NULL,
    txe_prestation_07       NVARCHAR(50)    NULL,
    txe_prestation_08       NVARCHAR(50)    NULL,
    txe_prestation_09       NVARCHAR(50)    NULL,
    txe_prestation_10       NVARCHAR(50)    NULL,
    txe_nom_filiation_0     VARCHAR(50)     NULL,
    txe_prenom_filiation_0  VARCHAR(50)     NULL,
    txe_date_naissance      DATE            NULL,
    txe_passeport           NVARCHAR(30)    NULL,
    txe_nationalite         NVARCHAR(50)    NULL,
    txe_email               NVARCHAR(100)   NULL,
    txe_heure_liberation    TIME            NULL,
    txe_compte_solde        NVARCHAR(20)    NULL,
    CONSTRAINT PK_tempo_ecran_mecano PRIMARY KEY (txe_societe, txe_user, txe_sequence)
);
*/

-- ============================================================================
-- TABLE ALTERNATIVE (Table 612 dans PBP)
-- ============================================================================

-- Table 612: tempo_present_excel (Version PBP)
-- Fichier physique: tmp_prex_dat
-- Note: Structure identique a tempo_ecran_mecano mais utilisee dans PBP
