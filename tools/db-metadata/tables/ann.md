# ann

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | nvarchar | 4 | non |  | 0 |
| 2 | `type_client` | nvarchar | 1 | non |  | 0 |
| 3 | `adherent` | nvarchar | 10 | non |  | 0 |
| 4 | `filiation_club` | nvarchar | 3 | non |  | 0 |
| 5 | `dossier` | nvarchar | 9 | non |  | 0 |
| 6 | `ordre` | nvarchar | 3 | non |  | 0 |
| 7 | `date` | char | 8 | non |  | 0 |
| 8 | `RowId_11` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ann_IDX_1 | NONCLUSTERED | oui | RowId_11 |

