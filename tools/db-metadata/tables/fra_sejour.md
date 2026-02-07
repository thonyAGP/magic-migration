# fra_sejour

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ressource` | nvarchar | 4 | non |  | 0 |
| 2 | `type_ressource` | nvarchar | 1 | non |  | 0 |
| 3 | `date_debut_sejour` | nvarchar | 8 | non |  | 0 |
| 4 | `date_fin_sejour` | nvarchar | 8 | non |  | 0 |
| 5 | `code_logement` | nvarchar | 6 | non |  | 0 |
| 6 | `mode_occupation` | nvarchar | 1 | non |  | 0 |
| 7 | `nb_occupant` | nvarchar | 3 | non |  | 0 |
| 8 | `numero_chambre` | nvarchar | 6 | non |  | 0 |
| 9 | `matrimonial` | nvarchar | 1 | non |  | 0 |
| 10 | `RowId_321` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fra_sejour_IDX_1 | NONCLUSTERED | oui | RowId_321 |

