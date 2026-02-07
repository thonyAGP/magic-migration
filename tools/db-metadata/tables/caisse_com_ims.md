# caisse_com_ims

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 0 |
| 2 | `from_ims` | nvarchar | 1 | non |  | 0 |
| 3 | `from_adh` | nvarchar | 1 | non |  | 0 |
| 4 | `from_ski` | nvarchar | 1 | non |  | 0 |
| 5 | `from_vil` | nvarchar | 1 | non |  | 0 |
| 6 | `from_vil_open_sessions` | nvarchar | 1 | non |  | 0 |
| 7 | `from_adh_open_sessions` | nvarchar | 1 | non |  | 0 |
| 8 | `from_ims_saisie_articles` | nvarchar | 1 | non |  | 0 |
| 9 | `from_vil_saisie_articles` | nvarchar | 1 | non |  | 0 |
| 10 | `from_ims_saisie_articles_serv` | nvarchar | 5 | non |  | 0 |
| 11 | `buffer_extension` | nvarchar | 107 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_com_ims_IDX_1 | NONCLUSTERED | oui | utilisateur |

