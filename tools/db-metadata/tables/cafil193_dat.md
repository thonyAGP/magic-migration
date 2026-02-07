# cafil193_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tra_date_transaction` | char | 8 | non |  | 0 |
| 2 | `tra_heur_transaction` | char | 6 | non |  | 0 |
| 3 | `tra_num_serie` | int | 10 | non |  | 0 |
| 4 | `tra_montant` | float | 53 | non |  | 0 |
| 5 | `tra_num_machine` | int | 10 | non |  | 0 |
| 6 | `tra_societe` | nvarchar | 1 | non |  | 0 |
| 7 | `tra_code_gm` | int | 10 | non |  | 0 |
| 8 | `tra_filiation` | int | 10 | non |  | 0 |
| 9 | `RowId_179` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil193_dat_IDX_1 | NONCLUSTERED | non | tra_num_serie, tra_date_transaction, tra_heur_transaction |
| cafil193_dat_IDX_3 | NONCLUSTERED | non | tra_societe, tra_code_gm, tra_filiation |
| cafil193_dat_IDX_4 | NONCLUSTERED | oui | RowId_179 |
| cafil193_dat_IDX_2 | NONCLUSTERED | non | tra_num_machine, tra_date_transaction, tra_heur_transaction |

