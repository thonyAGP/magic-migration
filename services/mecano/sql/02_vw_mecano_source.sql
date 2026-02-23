-- ============================================================================
-- VUE: vw_mecano_source
-- Description: Donnees sources pour le traitement MECANO
-- Equivalent Magic: Prg_664 (Liste mec preparation planning)
-- ============================================================================
-- Cette vue joint les tables gm-complet et hebergement pour obtenir
-- les sejours des clients avec leurs informations personnelles.
-- ============================================================================

CREATE OR ALTER VIEW dbo.vw_mecano_source
AS
SELECT
    -- Cle primaire
    gmc.gmc_societe                         AS societe,
    gmc.gmc_compte                          AS compte,
    gmc.gmc_filiation                       AS filiation,

    -- Informations client (de gm_complet)
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

    -- Informations sejour (de hebergement)
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

    -- Calculs derives
    DATEDIFF(YEAR, gmc.gmc_date_naissance, heb.heb_date_debut) AS age_calcule,

    -- Qualite client (Adulte, Enfant, Bebe, etc.)
    CASE
        WHEN heb.heb_age_num <= 2 THEN 'BB'      -- Bebe
        WHEN heb.heb_age_num <= 12 THEN 'ENF'   -- Enfant
        WHEN heb.heb_age_num <= 17 THEN 'ADO'   -- Adolescent
        ELSE 'ADU'                               -- Adulte
    END AS qualite,

    -- Indicateur single (seul dans le logement)
    CASE
        WHEN heb.heb_u_p_nb_occup = '1' THEN 'Y'
        ELSE 'N'
    END AS single_yn

FROM dbo.gm_complet gmc
INNER JOIN dbo.hebergement heb
    ON heb.heb_societe = gmc.gmc_societe
    AND heb.heb_num_compte = gmc.gmc_compte
    AND heb.heb_filiation = gmc.gmc_filiation
WHERE
    -- Filtre sur les statuts de sejour valides
    heb.heb_statut_sejour IN ('PR', 'AR', 'CO')  -- Present, Arrive, Confirme
GO

-- ============================================================================
-- Commentaires sur le mapping
-- ============================================================================
/*
MAPPING MAGIC -> SQL:

Colonnes gm_complet utilisees:
- {0,43} gmc_societe        -> societe
- {0,184} gmc_compte        -> compte
- {0,185} gmc_filiation     -> filiation
- {0,186} gmc_nom_complet   -> nom
- {0,187} gmc_prenom_complet -> prenom
- {0,189} gmc_numero_adherent -> numero_adherent
- {0,190} gmc_date_naissance -> date_naissance
- etc.

Colonnes hebergement utilisees:
- heb_date_debut, heb_date_fin -> dates sejour
- heb_nom_logement -> logement
- heb_code_sexe -> sexe
- heb_age_num -> age

Parametres de filtrage (passes en arguments):
- @p_date_debut DATE       -- Date de debut de periode
- @p_date_fin DATE         -- Date de fin de periode
- @p_categorie VARCHAR(8)  -- Categorie client (optionnel)
- @p_sejour VARCHAR(1)     -- Type de sejour (optionnel)
- @p_seminaire VARCHAR(20) -- Code seminaire (optionnel)
*/
