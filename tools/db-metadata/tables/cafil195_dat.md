# cafil195_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `car_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `car_num_serie` | int | 10 | non |  | 0 |
| 3 | `car_compte` | int | 10 | non |  | 0 |
| 4 | `car_filiation` | int | 10 | non |  | 0 |
| 5 | `car_fin_validite` | char | 8 | non |  | 0 |
| 6 | `car_statut` | nvarchar | 1 | non |  | 0 |
| 7 | `car_gratuite_bar` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil195_dat_IDX_3 | NONCLUSTERED | oui | car_societe, car_num_serie |
| cafil195_dat_IDX_1 | NONCLUSTERED | non | car_societe, car_compte, car_filiation |
| cafil195_dat_IDX_2 | NONCLUSTERED | oui | car_num_serie |

