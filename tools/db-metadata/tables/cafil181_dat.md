# cafil181_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ite_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `ite_compte_gm` | int | 10 | non |  | 0 |
| 3 | `ite_filiation` | int | 10 | non |  | 0 |
| 4 | `ite_imputation` | float | 53 | non |  | 0 |
| 5 | `ite_sous_imputation` | int | 10 | non |  | 0 |
| 6 | `ite_libelle` | nvarchar | 20 | oui |  | 0 |
| 7 | `ite_libelle_supplem` | nvarchar | 20 | oui |  | 0 |
| 8 | `ite_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `ite_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `ite_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `ite_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `ite_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `ite_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `ite_montant` | float | 53 | non |  | 0 |
| 15 | `ite_date_comptable` | char | 8 | non |  | 0 |
| 16 | `ite_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `ite_heure_operation` | char | 6 | non |  | 0 |
| 18 | `ite_nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `ite_flag_hotesses` | nvarchar | 1 | non |  | 0 |
| 20 | `ite_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `ite_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_173` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil181_dat_IDX_1 | NONCLUSTERED | non | ite_societe, ite_compte_gm, ite_date_d_operation, ite_heure_operation |
| cafil181_dat_IDX_3 | NONCLUSTERED | non | ite_societe, ite_compte_gm, ite_code_type, ite_date_d_operation, ite_heure_operation |
| cafil181_dat_IDX_2 | NONCLUSTERED | non | ite_societe, ite_compte_gm, ite_filiation, ite_date_d_operation, ite_heure_operation |
| cafil181_dat_IDX_4 | NONCLUSTERED | non | ite_societe, ite_date_comptable, ite_code_type |
| cafil181_dat_IDX_6 | NONCLUSTERED | oui | RowId_173 |
| cafil181_dat_IDX_5 | NONCLUSTERED | non | ite_societe, ite_date_comptable, ite_operateur, ite_code_type |

