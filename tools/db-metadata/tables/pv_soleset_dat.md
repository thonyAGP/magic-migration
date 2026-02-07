# pv_soleset_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_of_binding_id` | int | 10 | non |  | 0 |
| 2 | `sole_lenght_range_in_mm` | int | 10 | non |  | 0 |
| 3 | `sole_range_desc` | nvarchar | 12 | non |  | 0 |
| 4 | `sole_length_code` | nvarchar | 1 | non |  | 0 |
| 5 | `toe_piece` | nvarchar | 2 | non |  | 0 |
| 6 | `heel_piece` | nvarchar | 2 | non |  | 0 |
| 7 | `pv_service` | nvarchar | 4 | non |  | 0 |
| 8 | `RowId_411` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_soleset_dat_IDX_3 | NONCLUSTERED | oui | RowId_411 |
| pv_soleset_dat_IDX_2 | NONCLUSTERED | non | pv_service, type_of_binding_id, sole_length_code |
| pv_soleset_dat_IDX_1 | NONCLUSTERED | non | pv_service, type_of_binding_id, sole_lenght_range_in_mm |

