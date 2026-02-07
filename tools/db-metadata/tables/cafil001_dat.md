# cafil001_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rec_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `rec_num_terminal` | int | 10 | non |  | 0 |
| 3 | `rec_flag_traitement` | nvarchar | 1 | non |  | 0 |
| 4 | `rec_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil001_dat_IDX_1 | NONCLUSTERED | oui | rec_societe, rec_num_terminal, rec_hostname, rec_flag_traitement |

