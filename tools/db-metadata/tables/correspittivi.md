# correspittivi

**Nom logique Magic** : `correspittivi`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cor_row_id` | int | 10 | non |  | 0 |
| 2 | `cor_date_comptable` | char | 8 | non |  | 0 |
| 3 | `cor_date` | char | 8 | non |  | 0 |
| 4 | `cor_time` | char | 6 | non |  | 0 |
| 5 | `cor_service` | nvarchar | 4 | non |  | 0 |
| 6 | `cor_compte_analytique` | int | 10 | non |  | 0 |
| 7 | `cor_montant_ht` | float | 53 | non |  | 0 |
| 8 | `cor_montant_ttc` | float | 53 | non |  | 0 |
| 9 | `cor_tva` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| correspittivi_IDX_2 | NONCLUSTERED | non | cor_date_comptable, cor_compte_analytique |
| correspittivi_IDX_3 | NONCLUSTERED | non | cor_date_comptable, cor_service |
| correspittivi_IDX_1 | NONCLUSTERED | oui | cor_row_id |

