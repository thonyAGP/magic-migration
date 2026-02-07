# emaillist

**Nom logique Magic** : `emaillist`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `name` | nvarchar | 20 | non |  | 0 |
| 2 | `first_name` | nvarchar | 20 | non |  | 0 |
| 3 | `email` | nvarchar | 50 | non |  | 0 |
| 4 | `send_yes_no` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| emaillist_IDX_2 | NONCLUSTERED | non | send_yes_no |
| emaillist_IDX_1 | NONCLUSTERED | oui | name, first_name |

