# flpgros

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `name` | nvarchar | 64 | non |  | 0 |
| 2 | `date` | char | 8 | non |  | 0 |
| 3 | `heure` | char | 6 | non |  | 0 |
| 4 | `taille` | int | 10 | non |  | 0 |
| 5 | `pourcentage` | float | 53 | non |  | 0 |
| 6 | `pourcentage_cumule` | float | 53 | non |  | 0 |
| 7 | `nottodo` | bit |  | non |  | 0 |
| 8 | `chrono` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| flpgros_IDX_1 | NONCLUSTERED | oui | name |
| flpgros_IDX_2 | NONCLUSTERED | oui | taille, name |

