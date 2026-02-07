# remise_par_article

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service` | nvarchar | 5 | non |  | 0 |
| 2 | `article` | int | 10 | non |  | 0 |
| 3 | `remise_autorisee_article` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| remise_par_article_IDX_1 | NONCLUSTERED | oui | service, article |

