# cafil024_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mpr_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mpr_code_gm` | int | 10 | non |  | 0 |
| 3 | `mpr_filiation` | int | 10 | non |  | 0 |
| 4 | `mpr_code_prestation` | nvarchar | 6 | non |  | 0 |
| 5 | `mpr_code_article` | int | 10 | non |  | 0 |
| 6 | `mpr_quantite` | int | 10 | non |  | 0 |
| 7 | `mpr_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 8 | `mpr_date_operation` | char | 8 | non |  | 0 |
| 9 | `mpr_heure_operation` | char | 6 | non |  | 0 |
| 10 | `mpr_user` | nvarchar | 8 | non |  | 0 |
| 11 | `mpr_type_transaction` | nvarchar | 1 | non |  | 0 |
| 12 | `RowId_46` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil024_dat_IDX_1 | NONCLUSTERED | non | mpr_societe, mpr_code_gm, mpr_filiation, mpr_code_prestation, mpr_code_article |
| cafil024_dat_IDX_2 | NONCLUSTERED | oui | RowId_46 |

