# resort_credit

**Nom logique Magic** : `resort_credit`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rcr_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `rcr_num_compte` | int | 10 | non |  | 0 |
| 3 | `rcr_filiation` | int | 10 | non |  | 0 |
| 4 | `rcr_service` | nvarchar | 4 | non |  | 0 |
| 5 | `rcr_montant_attribue` | float | 53 | non |  | 0 |
| 6 | `rcr_montant_utilise` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resort_credit_IDX_1 | NONCLUSTERED | oui | rcr_societe, rcr_num_compte, rcr_filiation, rcr_service |

