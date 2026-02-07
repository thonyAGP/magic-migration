# cafil248_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `his_date_transaction` | char | 8 | non |  | 0 |
| 2 | `his_time_transaction` | char | 6 | non |  | 0 |
| 3 | `his_prefixe_d_acces` | nvarchar | 2 | non |  | 0 |
| 4 | `his_code_confid_` | int | 10 | non |  | 0 |
| 5 | `his_nom_personne` | nvarchar | 30 | non |  | 0 |
| 6 | `his_prenom_personne` | nvarchar | 20 | non |  | 0 |
| 7 | `his_date_debut` | char | 8 | non |  | 0 |
| 8 | `his_heure_debut` | char | 6 | non |  | 0 |
| 9 | `his_nb_taxe` | int | 10 | non |  | 0 |
| 10 | `his_num_ligne` | int | 10 | non |  | 0 |
| 11 | `his_num_poste` | int | 10 | non |  | 0 |
| 12 | `his_num_compose` | nvarchar | 23 | non |  | 0 |
| 13 | `his_montant` | float | 53 | non |  | 0 |
| 14 | `his_tarif_telephone` | float | 53 | non |  | 0 |
| 15 | `his_duree` | char | 6 | non |  | 0 |
| 16 | `his_pays_appele` | nvarchar | 20 | non |  | 0 |
| 17 | `his_centre_terrestre` | nvarchar | 8 | non |  | 0 |
| 18 | `his_transfert` | int | 10 | non |  | 0 |
| 19 | `his_flag_gratuite` | nvarchar | 1 | non |  | 0 |
| 20 | `his_raison_gratuite` | nvarchar | 15 | non |  | 0 |
| 21 | `his_flag_cloture` | nvarchar | 1 | non |  | 0 |
| 22 | `RowId_192` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil248_dat_IDX_4 | NONCLUSTERED | non | his_date_transaction |
| cafil248_dat_IDX_1 | NONCLUSTERED | non | his_prefixe_d_acces, his_date_transaction, his_time_transaction |
| cafil248_dat_IDX_2 | NONCLUSTERED | non | his_code_confid_, his_date_debut, his_heure_debut |
| cafil248_dat_IDX_3 | NONCLUSTERED | non | his_num_poste, his_date_debut, his_heure_debut |
| cafil248_dat_IDX_5 | NONCLUSTERED | non | his_prefixe_d_acces, his_centre_terrestre, his_num_poste, his_date_debut, his_heure_debut |
| cafil248_dat_IDX_6 | NONCLUSTERED | oui | RowId_192 |

