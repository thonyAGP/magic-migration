# realarca_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rac_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `rac_compte` | int | 10 | non |  | 0 |
| 3 | `rac_filiation` | int | 10 | non |  | 0 |
| 4 | `rac_numero_article` | int | 10 | non |  | 0 |
| 5 | `rac_user` | nvarchar | 8 | non |  | 0 |
| 6 | `rac_date` | char | 8 | non |  | 0 |
| 7 | `rac_time` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| realarca_dat_IDX_1 | NONCLUSTERED | oui | rac_societe, rac_compte, rac_filiation, rac_numero_article |

