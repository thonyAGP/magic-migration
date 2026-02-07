# cafil246_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tca_type_action` | nvarchar | 1 | non |  | 0 |
| 2 | `tca_libelle` | nvarchar | 20 | non |  | 0 |
| 3 | `tca_code_acces` | nvarchar | 2 | non |  | 0 |
| 4 | `tca_modifiable__` | nvarchar | 1 | non |  | 0 |
| 5 | `RowId_190` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil246_dat_IDX_2 | NONCLUSTERED | non | tca_code_acces |
| cafil246_dat_IDX_3 | NONCLUSTERED | oui | RowId_190 |
| cafil246_dat_IDX_1 | NONCLUSTERED | non | tca_type_action |

