# import_go__imgo

**Nom logique Magic** : `import_go__imgo`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 32 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `imgo_sequence` | int | 10 | non |  | 0 |
| 2 | `imgo_no_ligne` | int | 10 | non |  | 0 |
| 3 | `imgo_village` | char | 50 | non |  | 0 |
| 4 | `imgo_identifiant_vendeur` | nvarchar | 10 | non |  | 0 |
| 5 | `imgo_nom` | nvarchar | 30 | non |  | 0 |
| 6 | `imgo_prenom` | nvarchar | 20 | non |  | 0 |
| 7 | `imgo_date_arrivee` | char | 8 | non |  | 0 |
| 8 | `imgo_date_debut` | char | 8 | non |  | 0 |
| 9 | `imgo_date_fin` | char | 8 | non |  | 0 |
| 10 | `imgo_emploi` | nvarchar | 30 | non |  | 0 |
| 11 | `imgo_emploi_fonction_libelle` | nvarchar | 30 | non |  | 0 |
| 12 | `imgo_numero_chambre_demandee` | nvarchar | 10 | non |  | 0 |
| 13 | `imgo_num_chbre_pre_attribuee_Go` | nvarchar | 10 | non |  | 0 |
| 14 | `imgo_num_chbre_pre_attribuee_Gm` | nvarchar | 10 | non |  | 0 |
| 15 | `imgo_qualite` | nvarchar | 6 | non |  | 0 |
| 16 | `imgo_contrat` | nvarchar | 10 | non |  | 0 |
| 17 | `imgo_flag_validation` | bit |  | non |  | 0 |
| 18 | `imgo_flag_chambre_inconnue_go` | bit |  | non |  | 0 |
| 19 | `imgo_flag_chambre_inconnue_gm` | bit |  | non |  | 0 |
| 20 | `imgo_compte_adherent` | int | 10 | non |  | 0 |
| 21 | `imgo_numero_compte` | int | 10 | non |  | 0 |
| 22 | `imgo_chambre_attribuee` | bit |  | non |  | 0 |
| 23 | `imgo_message_erreur_affectation` | nvarchar | 1024 | non |  | 0 |
| 24 | `imgo_code_logement` | nvarchar | 6 | non |  | 0 |
| 25 | `imgo_date_naissance` | char | 8 | non |  | 0 |
| 26 | `imgo_sexe` | nvarchar | 5 | non |  | 0 |
| 27 | `imgo_nationalite` | nvarchar | 3 | non |  | 0 |
| 28 | `imgo_service_sgbg` | nvarchar | 30 | non |  | 0 |
| 29 | `imgo_fonction_sgbd` | nvarchar | 30 | non |  | 0 |
| 30 | `imgo_titre_sgbd` | nvarchar | 30 | non |  | 0 |
| 31 | `imgo_nationalite_sgbd` | nvarchar | 2 | non |  | 0 |
| 32 | `imgo_matricule_wd` | nvarchar | 30 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| imgo_IDX_2 | NONCLUSTERED | non | imgo_sequence, imgo_identifiant_vendeur |
| imgo_IDX_1 | NONCLUSTERED | oui | imgo_sequence, imgo_no_ligne |

