# cafil123_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `his_code_vendeur` | int | 10 | non |  | 0 |
| 2 | `his_num_mk3` | int | 10 | non |  | 0 |
| 3 | `his_date_transaction` | char | 8 | non |  | 0 |
| 4 | `his_time_transaction` | char | 6 | non |  | 0 |
| 5 | `his_num_ticket` | int | 10 | non |  | 0 |
| 6 | `his_num_carte` | int | 10 | non |  | 0 |
| 7 | `his_signe` | nvarchar | 1 | non |  | 0 |
| 8 | `his_code_article` | int | 10 | non |  | 0 |
| 9 | `his_quantite` | int | 10 | non |  | 0 |
| 10 | `his_prix_unitaire` | int | 10 | non |  | 0 |
| 11 | `his_nom_personne` | nvarchar | 30 | non |  | 0 |
| 12 | `his_prenom_personne` | nvarchar | 20 | non |  | 0 |
| 13 | `his_num_adherent` | int | 10 | non |  | 0 |
| 14 | `his_filiation` | int | 10 | non |  | 0 |
| 15 | `his_flag_gratuite` | nvarchar | 1 | non |  | 0 |
| 16 | `his_raison_gratuite` | nvarchar | 15 | non |  | 0 |
| 17 | `his_historique` | nvarchar | 1 | non |  | 0 |
| 18 | `RowId_145` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil123_dat_IDX_1 | NONCLUSTERED | non | his_code_vendeur, his_num_mk3, his_date_transaction, his_time_transaction, his_num_ticket, his_num_carte, his_code_article |
| cafil123_dat_IDX_2 | NONCLUSTERED | oui | RowId_145 |

