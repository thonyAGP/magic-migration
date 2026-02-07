# log_validation

**Nom logique Magic** : `log_validation`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lva_date` | char | 8 | non |  | 0 |
| 2 | `lva_heure` | char | 6 | non |  | 0 |
| 3 | `lva_compte` | int | 10 | non |  | 0 |
| 4 | `lva_filiation` | int | 10 | non |  | 0 |
| 5 | `lva_operation` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_validation_IDX_1 | NONCLUSTERED | oui | lva_date, lva_heure, lva_compte, lva_filiation |

