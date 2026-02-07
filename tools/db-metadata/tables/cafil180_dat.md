# cafil180_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `itg_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `itg_compte_gm` | int | 10 | non |  | 0 |
| 3 | `itg_filiation` | int | 10 | non |  | 0 |
| 4 | `itg_imputation` | float | 53 | non |  | 0 |
| 5 | `itg_sous_imputation` | int | 10 | non |  | 0 |
| 6 | `itg_libelle` | nvarchar | 15 | non |  | 0 |
| 7 | `itg_libelle_supplem` | nvarchar | 15 | non |  | 0 |
| 8 | `itg_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `itg_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `itg_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `itg_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `itg_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `itg_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `itg_montant` | float | 53 | non |  | 0 |
| 15 | `itg_date_comptable` | char | 8 | non |  | 0 |
| 16 | `itg_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `itg_heure_operation` | char | 6 | non |  | 0 |
| 18 | `itg_nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `itg_flag_hotesses` | nvarchar | 1 | non |  | 0 |
| 20 | `itg_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `itg_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_172` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil180_dat_IDX_3 | NONCLUSTERED | non | itg_societe, itg_compte_gm, itg_code_type, itg_date_d_operation, itg_heure_operation |
| cafil180_dat_IDX_2 | NONCLUSTERED | non | itg_societe, itg_compte_gm, itg_filiation, itg_date_d_operation, itg_heure_operation |
| cafil180_dat_IDX_4 | NONCLUSTERED | non | itg_societe, itg_date_comptable, itg_code_type |
| cafil180_dat_IDX_1 | NONCLUSTERED | non | itg_societe, itg_compte_gm, itg_date_d_operation, itg_heure_operation |
| cafil180_dat_IDX_6 | NONCLUSTERED | oui | RowId_172 |
| cafil180_dat_IDX_5 | NONCLUSTERED | non | itg_societe, itg_date_comptable, itg_operateur, itg_code_type |

