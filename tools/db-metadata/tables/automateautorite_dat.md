# automateautorite_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type` | nvarchar | 1 | non |  | 0 |
| 2 | `ordre_edition` | int | 10 | non |  | 0 |
| 3 | `type_edition` | nvarchar | 3 | non |  | 0 |
| 4 | `nbre_copie` | int | 10 | non |  | 0 |
| 5 | `description` | nvarchar | 60 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| automateautorite_dat_IDX_1 | NONCLUSTERED | oui | type, ordre_edition |

