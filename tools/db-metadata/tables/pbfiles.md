# pbfiles

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `filenumber` | int | 10 | non |  | 0 |
| 2 | `filename` | nvarchar | 50 | non |  | 0 |
| 3 | `recordnumber` | float | 53 | non |  | 0 |
| 4 | `physicalname` | nvarchar | 100 | non |  | 0 |
| 5 | `chrono` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pbfiles_IDX_1 | NONCLUSTERED | oui | filenumber |
| pbfiles_IDX_2 | NONCLUSTERED | oui | recordnumber, filenumber |

