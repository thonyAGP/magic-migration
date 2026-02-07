# logicalnames

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | int | 10 | non |  | 0 |
| 2 | `program` | int | 10 | non |  | 0 |
| 3 | `task` | int | 10 | non |  | 0 |
| 4 | `first_logicalname` | nvarchar | 64 | non |  | 0 |
| 5 | `value_of_1st_ln` | nvarchar | 64 | non |  | 0 |
| 6 | `text` | nvarchar | 256 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| logicalnames_IDX_1 | NONCLUSTERED | oui | chrono |

