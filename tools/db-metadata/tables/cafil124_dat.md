# cafil124_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 21 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `err_date` | char | 8 | non |  | 0 |
| 2 | `err_time` | char | 6 | non |  | 0 |
| 3 | `err_numero` | int | 10 | non |  | 0 |
| 4 | `err_transaction_num` | float | 53 | non |  | 0 |
| 5 | `err_qui_genere` | nvarchar | 1 | non |  | 0 |
| 6 | `err_mk3_traite` | nvarchar | 1 | non |  | 0 |
| 7 | `err_mk3_traite_date` | char | 8 | non |  | 0 |
| 8 | `err_mk3_traite_time` | char | 6 | non |  | 0 |
| 9 | `err_mk3_date` | char | 8 | non |  | 0 |
| 10 | `err_mk3_time` | char | 6 | non |  | 0 |
| 11 | `err_mk3_numero` | int | 10 | non |  | 0 |
| 12 | `err_mk3_ticket` | int | 10 | non |  | 0 |
| 13 | `err_mk3_num_de_serie` | int | 10 | non |  | 0 |
| 14 | `err_mk3_code_vendeur` | int | 10 | non |  | 0 |
| 15 | `err_mk3_nb_d_occurs` | int | 10 | non |  | 0 |
| 16 | `err_mk3_signe` | nvarchar | 1 | non |  | 0 |
| 17 | `err_mk3_non_exploite` | nvarchar | 1 | non |  | 0 |
| 18 | `err_mk3_auto_commut_` | int | 10 | non |  | 0 |
| 19 | `err_mk3_forfait` | nvarchar | 1 | non |  | 0 |
| 20 | `err_reste` | nvarchar | 216 | non |  | 0 |
| 21 | `RowId_146` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil124_dat_IDX_1 | NONCLUSTERED | non | err_date, err_time, err_numero |
| cafil124_dat_IDX_2 | NONCLUSTERED | oui | RowId_146 |

