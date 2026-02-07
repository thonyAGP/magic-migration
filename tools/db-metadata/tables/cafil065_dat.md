# cafil065_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sda_num_serie` | nvarchar | 1 | non |  | 0 |
| 2 | `sda_code_utilise` | nvarchar | 1 | non |  | 0 |
| 3 | `sda_num_sda` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil065_dat_IDX_2 | NONCLUSTERED | oui | sda_num_sda |
| cafil065_dat_IDX_1 | NONCLUSTERED | oui | sda_num_serie, sda_code_utilise, sda_num_sda |

