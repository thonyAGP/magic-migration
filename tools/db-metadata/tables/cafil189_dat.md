# cafil189_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `epm_num_term` | int | 10 | non |  | 0 |
| 2 | `epm_date` | char | 8 | non |  | 0 |
| 3 | `epm_heure` | char | 6 | non |  | 0 |
| 4 | `epm_numserie` | int | 10 | non |  | 0 |
| 5 | `epm_montant` | float | 53 | non |  | 0 |
| 6 | `RowId_175` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil189_dat_IDX_2 | NONCLUSTERED | oui | RowId_175 |
| cafil189_dat_IDX_1 | NONCLUSTERED | non | epm_numserie, epm_date, epm_heure |

