# maj_appli_tpe

**Nom logique Magic** : `maj_appli_tpe`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mat_rowid` | int | 10 | non |  | 0 |
| 2 | `mat_appli` | nvarchar | 20 | non |  | 0 |
| 3 | `mat_version` | nvarchar | 10 | non |  | 0 |
| 4 | `mat_fichier` | nvarchar | 50 | non |  | 0 |
| 5 | `mat_finalise` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| maj_appli_tpe_IDX_2 | NONCLUSTERED | oui | mat_appli, mat_version, mat_rowid |
| maj_appli_tpe_IDX_1 | NONCLUSTERED | oui | mat_rowid |

