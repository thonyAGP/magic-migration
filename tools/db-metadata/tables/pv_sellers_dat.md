# pv_sellers_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `slr_code` | nvarchar | 4 | non |  | 0 |
| 2 | `slr_nom` | nvarchar | 30 | non |  | 0 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_sellers_dat_IDX_1 | NONCLUSTERED | oui | pv_service, slr_code |
| pv_sellers_dat_IDX_2 | NONCLUSTERED | oui | pv_service, slr_nom, slr_code |

