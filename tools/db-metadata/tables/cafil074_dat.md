# cafil074_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pre_code_prestation` | nvarchar | 6 | non |  | 0 |
| 2 | `pre_libelle` | nvarchar | 20 | non |  | 0 |
| 3 | `pre_flag_utilisation` | nvarchar | 1 | non |  | 0 |
| 4 | `pre_code_article` | int | 10 | non |  | 0 |
| 5 | `pre_modifiable__` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil074_dat_IDX_2 | NONCLUSTERED | oui | pre_code_prestation |
| cafil074_dat_IDX_1 | NONCLUSTERED | oui | pre_code_prestation, pre_code_article |

