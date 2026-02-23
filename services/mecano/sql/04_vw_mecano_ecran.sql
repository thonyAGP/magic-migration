-- ============================================================================
-- VUE: vw_mecano_ecran
-- Description: Vue finale pour affichage MECANO (equivalent tempo_ecran_mecano)
-- Equivalent Magic: Prg_666 (Creation tempo ecran generique)
-- ============================================================================
-- Cette vue produit le format final attendu par l'ecran de consultation
-- (equivalent de la table tempo_ecran_mecano / tempo_present_excel)
-- ============================================================================

CREATE OR ALTER VIEW dbo.vw_mecano_ecran
AS
SELECT
    -- Cle primaire
    t.societe                               AS txe_societe,
    SYSTEM_USER                             AS txe_user,          -- Utilisateur courant
    t.sequence_temp                         AS txe_sequence,

    -- Informations client
    LEFT(t.nom, 15)                         AS txe_nom,
    LEFT(t.prenom, 9)                       AS txe_prenom,
    LEFT(t.libelle_sexe, 2)                 AS txe_sexe,
    LEFT(t.qualite_complete, 7)             AS txe_qualite,
    t.age                                   AS txe_age,

    -- Logement
    LEFT(t.logement_complet, 13)            AS txe_logement,
    LEFT(t.pays_residence, 2)               AS txe_pays,

    -- Identification
    t.numero_adherent_format                AS txe_numero_adherent,

    -- Dates et heures
    t.date_arrivee                          AS txe_date_arrivee,
    t.heure_arrivee                         AS txe_time_arrivee,
    t.date_depart                           AS txe_date_depart,
    t.heure_depart                          AS txe_time_depart,

    -- Indicateurs
    t.bebe                                  AS txe_bebe,
    t.millesias                             AS txe_millesias,
    t.liste_blanche                         AS txe_liste_blanche,
    t.retour_circuit                        AS txe_retour_circuit,

    -- Compte et filiation
    t.compte                                AS txe_compte,
    t.filiation                             AS txe_filiation,

    -- Coordonnees (a enrichir depuis client_gm si necessaire)
    NULL                                    AS txe_telephone_int,
    t.ville                                 AS txe_telext___commune,
    t.code_postal                           AS txe_fax______burpost,
    ''                                      AS txe_type_ecran__cp,
    t.etat_province                         AS txe_etat_province,
    t.num_rue                               AS txe_num_rue,
    t.nom_rue                               AS txe_nom_rue,

    -- Logement details
    t.single_yn                             AS txe_single_y_n,
    t.code_logement                         AS txe_code_logement,

    -- Dossier et seminaire
    CONCAT(t.compte, '/', t.filiation)      AS txe_dossier_na,
    ''                                      AS txe_nom_seminaire,

    -- Commentaires (vides par defaut, a enrichir)
    ''                                      AS txe_comment_01,
    ''                                      AS txe_comment_02,
    ''                                      AS txe_comment_03,
    ''                                      AS txe_comment_04,
    ''                                      AS txe_comment_05,

    -- Prestations (vides par defaut, a enrichir depuis prestations)
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

    -- Filiation (titulaire du dossier)
    ''                                      AS txe_nom_filiation_0,
    ''                                      AS txe_prenom_filiation_0,

    -- Informations complementaires
    t.date_naissance                        AS txe_date_naissance,
    t.passeport                             AS txe_passeport,
    t.nationalite                           AS txe_nationalite,
    ''                                      AS txe_email,
    t.heure_liberation                      AS txe_heure_liberation,
    ''                                      AS txe_compte_solde

FROM dbo.vw_mecano_traitement t
GO

-- ============================================================================
-- Vue alternative: Par nom (equivalent Prg_245 dans PBP)
-- ============================================================================
CREATE OR ALTER VIEW dbo.vw_mecano_ecran_par_nom
AS
SELECT *
FROM dbo.vw_mecano_ecran
ORDER BY txe_nom, txe_prenom, txe_date_arrivee
GO

-- ============================================================================
-- Vue alternative: Par dossier (equivalent Prg_246 dans PBP)
-- ============================================================================
CREATE OR ALTER VIEW dbo.vw_mecano_ecran_par_dossier
AS
SELECT *
FROM dbo.vw_mecano_ecran
ORDER BY txe_compte, txe_filiation, txe_date_arrivee
GO

-- ============================================================================
-- Commentaires sur le mapping final
-- ============================================================================
/*
MAPPING TEMPO_ECRAN_MECANO:

Colonnes remplies depuis vw_mecano_traitement:
- txe_societe, txe_user, txe_sequence: Cle primaire
- txe_nom, txe_prenom: Nom et prenom (tronques)
- txe_sexe, txe_qualite, txe_age: Qualite client
- txe_logement, txe_pays: Hebergement
- txe_numero_adherent: Format complet
- txe_date_arrivee/depart: Dates sejour
- txe_bebe, txe_millesias, txe_liste_blanche, txe_retour_circuit: Indicateurs

Colonnes a enrichir:
- txe_comment_01..05: Depuis table commentaires si existante
- txe_prestation_01..10: Depuis table prestations client
- txe_nom/prenom_filiation_0: Depuis gm_complet pour filiation 0
- txe_email: Depuis table contacts client

VUES ALTERNATIVES:
- vw_mecano_ecran_par_nom: Tri alphabetique (Prg_245)
- vw_mecano_ecran_par_dossier: Tri par dossier (Prg_246)
*/
