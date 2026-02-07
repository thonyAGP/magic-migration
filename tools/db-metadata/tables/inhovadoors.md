# inhovadoors

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `acces` | nvarchar | 128 | non |  | 0 |
| 2 | `chambre` | nvarchar | 128 | non |  | 0 |
| 3 | `serrure` | nvarchar | 128 | non |  | 0 |
| 4 | `type` | nvarchar | 128 | non |  | 0 |
| 5 | `buffer_1` | nvarchar | 128 | non |  | 0 |
| 6 | `buffer_2` | nvarchar | 128 | non |  | 0 |
| 7 | `buffer_3` | nvarchar | 128 | non |  | 0 |
| 8 | `niveau` | nvarchar | 128 | non |  | 0 |
| 9 | `buffer_reste` | nvarchar | 128 | non |  | 0 |
| 10 | `RowId_346` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| inhovadoors_IDX_1 | NONCLUSTERED | non | type, chambre |
| inhovadoors_IDX_2 | NONCLUSTERED | oui | RowId_346 |

