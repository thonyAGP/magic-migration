# extabletva_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_tva` | int | 10 | non |  | 0 |
| 2 | `tva` | float | 53 | non |  | 0 |
| 3 | `tva_par_default` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| extabletva_dat_IDX_2 | NONCLUSTERED | non | tva_par_default |
| extabletva_dat_IDX_1 | NONCLUSTERED | oui | code_tva |

