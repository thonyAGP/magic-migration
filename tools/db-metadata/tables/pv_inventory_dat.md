# pv_inventory_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date` | char | 8 | non |  | 0 |
| 2 | `name` | nvarchar | 20 | non |  | 0 |
| 3 | `comment` | nvarchar | 100 | non |  | 0 |
| 4 | `validated` | bit |  | non |  | 0 |
| 5 | `date_modif` | char | 8 | non |  | 0 |
| 6 | `time_modif` | char | 6 | non |  | 0 |
| 7 | `user_modif` | nvarchar | 10 | non |  | 0 |
| 8 | `pv_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_inventory_dat_IDX_2 | NONCLUSTERED | non | pv_service, validated |
| pv_inventory_dat_IDX_1 | NONCLUSTERED | oui | pv_service, date |

