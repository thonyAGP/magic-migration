# poste_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `n_secu` | float | 53 | non |  | 0 |
| 2 | `service` | nvarchar | 14 | non |  | 0 |
| 3 | `fonction` | nvarchar | 15 | non |  | 0 |
| 4 | `muster_sta` | float | 53 | non |  | 0 |
| 5 | `fire_alarm` | nvarchar | 30 | non |  | 0 |
| 6 | `fire_gener` | nvarchar | 30 | non |  | 0 |
| 7 | `general_al` | nvarchar | 30 | non |  | 0 |
| 8 | `abandon_si` | nvarchar | 23 | non |  | 0 |
| 9 | `edition` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| poste_dat_IDX_1 | NONCLUSTERED | oui | n_secu |

