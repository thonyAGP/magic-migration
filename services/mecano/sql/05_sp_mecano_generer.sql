-- ============================================================================
-- PROCEDURE: sp_mecano_generer
-- Description: Genere les donnees MECANO avec parametres de filtrage
-- Equivalent Magic: Prg_18 (Liste Mecanographique) - Point d'entree
-- ============================================================================
-- Cette procedure replique le flux complet MECANO:
-- 1. Reset des tables temporaires
-- 2. Preparation des donnees
-- 3. Traitements 1, 2, 3
-- 4. Groupage
-- 5. Creation tempo ecran
-- ============================================================================

CREATE OR ALTER PROCEDURE dbo.sp_mecano_generer
    @p_societe          NVARCHAR(2),
    @p_date_debut       DATE,
    @p_date_fin         DATE,
    @p_categorie        NVARCHAR(8)     = NULL,  -- Filtre categorie client
    @p_sejour           NVARCHAR(1)     = NULL,  -- Type de sejour (C=Circuit, S=Sejour)
    @p_seminaire        NVARCHAR(20)    = NULL,  -- Code seminaire
    @p_tri              NVARCHAR(1)     = 'N',   -- N=Nom, D=Dossier
    @p_filtre_fidelite  BIT             = 0      -- Filtre fidelite uniquement
AS
BEGIN
    SET NOCOUNT ON;

    -- ========================================================================
    -- Variables
    -- ========================================================================
    DECLARE @v_user         NVARCHAR(20) = SYSTEM_USER;
    DECLARE @v_count        INT = 0;
    DECLARE @v_sequence     INT = 0;

    -- ========================================================================
    -- ETAPE 1: Reset des tables temporaires (equivalent Prg_206)
    -- ========================================================================
    DELETE FROM dbo.tempo_ecran_mecano
    WHERE txe_societe = @p_societe
      AND txe_user = @v_user;

    -- ========================================================================
    -- ETAPE 2-5: Insertion des donnees (equivalent Prg_664 + 665 + 666)
    -- ========================================================================
    WITH
    -- Source de donnees avec filtres
    source_data AS (
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
            heb.heb_liberation_chambre,
            heb.heb_code_package
        FROM dbo.gm_complet gmc
        INNER JOIN dbo.hebergement heb
            ON heb.heb_societe = gmc.gmc_societe
            AND heb.heb_num_compte = gmc.gmc_compte
            AND heb.heb_filiation = gmc.gmc_filiation
        WHERE gmc.gmc_societe = @p_societe
          AND heb.heb_statut_sejour IN ('PR', 'AR', 'CO')
          -- Filtre periode
          AND heb.heb_date_debut <= @p_date_fin
          AND heb.heb_date_fin >= @p_date_debut
          -- Filtre categorie (optionnel)
          AND (@p_categorie IS NULL OR gmc.gmc_type_de_client = @p_categorie)
          -- Filtre fidelite (optionnel)
          AND (@p_filtre_fidelite = 0 OR gmc.gmc_code_fidelite IS NOT NULL)
    ),

    -- Traitements avec calculs
    traitement AS (
        SELECT
            sd.*,
            -- Sequence
            ROW_NUMBER() OVER (
                ORDER BY
                    CASE @p_tri
                        WHEN 'N' THEN sd.gmc_nom_complet
                        ELSE CAST(sd.gmc_compte AS VARCHAR(20))
                    END,
                    sd.gmc_nom_complet,
                    sd.gmc_prenom_complet
            ) AS sequence,

            -- Libelle sexe
            CASE sd.heb_code_sexe
                WHEN 'M' THEN 'M.'
                WHEN 'F' THEN 'Mme'
                ELSE ''
            END AS libelle_sexe,

            -- Qualite
            CASE
                WHEN sd.heb_age_num <= 2 THEN 'BB'
                WHEN sd.heb_age_num <= 12 THEN 'ENF'
                WHEN sd.heb_age_num <= 17 THEN 'ADO'
                ELSE 'ADU'
            END AS qualite,

            -- Indicateurs
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

    -- ========================================================================
    -- Retour du resultat
    -- ========================================================================
    SELECT
        @v_count AS nb_enregistrements,
        @p_societe AS societe,
        @p_date_debut AS date_debut,
        @p_date_fin AS date_fin,
        @p_tri AS tri_applique;

END
GO

-- ============================================================================
-- Exemple d'utilisation
-- ============================================================================
/*
-- Generer la liste MECANO pour la societe 'CM' du 01/01/2024 au 31/01/2024
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_tri = 'N';  -- Tri par nom

-- Consulter les resultats
SELECT * FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM'
  AND txe_user = SYSTEM_USER
ORDER BY txe_sequence;
*/
