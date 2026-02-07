# fra_commentaire

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ressource` | nvarchar | 4 | non |  | 0 |
| 2 | `type_ressource` | nvarchar | 1 | non |  | 0 |
| 3 | `type_commentaire` | nvarchar | 1 | non |  | 0 |
| 4 | `commentaire` | nvarchar | 60 | non |  | 0 |
| 5 | `RowId_318` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fra_commentaire_IDX_1 | NONCLUSTERED | oui | RowId_318 |

