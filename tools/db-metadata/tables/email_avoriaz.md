# email_avoriaz

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `compte` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| email_avoriaz_IDX_1 | NONCLUSTERED | oui | societe, compte, filiation |

