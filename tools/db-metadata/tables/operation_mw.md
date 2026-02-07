# operation_mw

**Nom logique Magic** : `operation_mw`

| Info | Valeur |
|------|--------|
| Lignes | 52 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `omw_code_operation` | nvarchar | 10 | non |  | 52 |
| 2 | `omw_code_categorie` | nvarchar | 10 | non |  | 1 |
| 3 | `omw_libelle_operation` | nvarchar | 200 | non |  | 52 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| operation_mw_IDX_1 | NONCLUSTERED | oui | omw_code_operation |
| operation_mw_IDX_2 | NONCLUSTERED | non | omw_code_categorie |

