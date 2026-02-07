# correspittivi_boutique

**Nom logique Magic** : `correspittivi_boutique`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cob_date_comptable` | char | 8 | non |  | 0 |
| 2 | `cob_date` | char | 8 | non |  | 0 |
| 3 | `cob_time` | char | 6 | non |  | 0 |
| 4 | `cob_service` | nvarchar | 4 | non |  | 0 |
| 5 | `cob_compte_analytique` | int | 10 | non |  | 0 |
| 6 | `cob_montant_ht` | float | 53 | non |  | 0 |
| 7 | `cob_montant_ttc` | float | 53 | non |  | 0 |
| 8 | `cob_tva` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| correspittivi_boutique_IDX_1 | NONCLUSTERED | oui | cob_date_comptable, cob_compte_analytique, cob_tva |

