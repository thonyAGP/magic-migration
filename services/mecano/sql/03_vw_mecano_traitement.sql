-- ============================================================================
-- VUE: vw_mecano_traitement
-- Description: Traitement intermediaire MECANO (equivalent Traitements 1, 2, 3)
-- Equivalent Magic: Prg_668, 669, 670 (Traitement Mecano 1, 2, 3)
-- ============================================================================
-- Cette vue represente les transformations successives appliquees aux donnees
-- pour preparer l'affichage final.
-- ============================================================================

CREATE OR ALTER VIEW dbo.vw_mecano_traitement
AS
WITH
-- ============================================================================
-- Etape 1: Traitement Mecano 1 (Prg_668)
-- Agregation par compte/filiation avec calcul des totaux
-- ============================================================================
traitement_1 AS (
    SELECT
        src.societe,
        src.compte,
        src.filiation,
        src.nom,
        src.prenom,
        src.numero_adherent,
        src.date_naissance,
        src.nationalite,
        src.passeport,
        src.pays_residence,
        src.code_postal,
        src.ville,
        src.etat_province,
        src.num_rue,
        src.nom_rue,
        src.code_fidelite,
        src.type_client,
        src.date_arrivee,
        src.heure_arrivee,
        src.date_depart,
        src.heure_depart,
        src.logement,
        src.code_logement,
        src.code_sexe,
        src.age,
        src.qualite,
        src.single_yn,
        src.heure_liberation,
        src.code_package,
        src.statut_sejour,

        -- Numero de sequence (ROW_NUMBER pour ordonner)
        ROW_NUMBER() OVER (
            PARTITION BY src.societe
            ORDER BY src.date_arrivee, src.nom, src.prenom
        ) AS sequence_temp,

        -- Comptage des membres du meme groupe (filiation)
        COUNT(*) OVER (
            PARTITION BY src.societe, src.compte
        ) AS nb_membres_groupe

    FROM dbo.vw_mecano_source src
),

-- ============================================================================
-- Etape 2: Traitement Mecano 2 (Prg_669)
-- Enrichissement avec informations complementaires
-- ============================================================================
traitement_2 AS (
    SELECT
        t1.*,

        -- Determination du libelle sexe
        CASE t1.code_sexe
            WHEN 'M' THEN 'M.'
            WHEN 'F' THEN 'Mme'
            WHEN 'E' THEN 'Enf'
            ELSE ''
        END AS libelle_sexe,

        -- Format qualite complete
        CONCAT(
            CASE t1.code_sexe
                WHEN 'M' THEN 'M.'
                WHEN 'F' THEN 'Mme'
                ELSE ''
            END,
            ' ',
            t1.qualite
        ) AS qualite_complete,

        -- Indicateur retour (client deja venu)
        CASE
            WHEN t1.code_fidelite IS NOT NULL AND t1.code_fidelite <> '' THEN 'RET'
            ELSE ''
        END AS retour_circuit,

        -- Indicateur millesias (fidelite)
        t1.code_fidelite AS millesias,

        -- Indicateur liste blanche
        CASE
            WHEN t1.type_client = 'VIP' THEN 'LB'
            ELSE ''
        END AS liste_blanche

    FROM traitement_1 t1
),

-- ============================================================================
-- Etape 3: Traitement Mecano 3 (Prg_670)
-- Agregation finale et preparation sortie
-- ============================================================================
traitement_3 AS (
    SELECT
        t2.*,

        -- Format numero adherent complet
        CONCAT(
            t2.societe, ' ',
            FORMAT(t2.numero_adherent, '0000000000'), '-',
            t2.compte, '/',
            FORMAT(t2.filiation, '000')
        ) AS numero_adherent_format,

        -- Format logement complet
        CONCAT(t2.code_logement, ' ', t2.logement) AS logement_complet,

        -- Age affiche (bebe indicator)
        CASE
            WHEN t2.age <= 2 THEN CONCAT(t2.age, ' BB')
            ELSE CAST(t2.age AS VARCHAR(10))
        END AS age_affiche,

        -- Indicateur bebe
        CASE
            WHEN t2.age <= 2 THEN 'BB'
            ELSE ''
        END AS bebe

    FROM traitement_2 t2
)

SELECT * FROM traitement_3
GO

-- ============================================================================
-- Commentaires sur les traitements
-- ============================================================================
/*
TRAITEMENT MECANO 1 (Prg_668):
- Lecture des donnees sources
- Calcul du numero de sequence
- Comptage des membres par groupe/dossier
- Premiere passe de filtrage

TRAITEMENT MECANO 2 (Prg_669):
- Enrichissement avec libelles
- Calcul des indicateurs (retour, millesias, liste blanche)
- Formatage des donnees

TRAITEMENT MECANO 3 (Prg_670):
- Agregation finale
- Formatage des numeros et codes
- Preparation pour l'ecran

GROUPAGE MECANO (Prg_671):
- Regroupement des accompagnants
- Lien avec le dossier principal
- Tri final

Les vues ci-dessus combinent ces 4 etapes en une seule logique SQL.
*/
