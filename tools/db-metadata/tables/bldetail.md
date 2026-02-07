# bldetail

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `code_8chiffres` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
| 4 | `type` | nvarchar | 1 | non |  | 0 |
| 5 | `montant` | float | 53 | non |  | 0 |
| 6 | `date_operation` | char | 8 | non |  | 0 |
| 7 | `time_operation` | char | 6 | non |  | 0 |
| 8 | `utilisateur` | nvarchar | 10 | non |  | 0 |
| 9 | `RowId_19` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bldetail_IDX_1 | NONCLUSTERED | non | societe, code_8chiffres, filiation, type |
| bldetail_IDX_3 | NONCLUSTERED | oui | RowId_19 |
| bldetail_IDX_2 | NONCLUSTERED | non | societe, code_8chiffres, filiation, date_operation, time_operation |

