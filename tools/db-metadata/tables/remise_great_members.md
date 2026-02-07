# remise_great_members

**Nom logique Magic** : `remise_great_members`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rgm_service` | nvarchar | 4 | non |  | 0 |
| 2 | `rgm_imputation` | float | 53 | non |  | 0 |
| 3 | `rgm_fidelisation` | nvarchar | 1 | non |  | 0 |
| 4 | `rgm_pourcentage_remise` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| rgm_great_members_IDX_1 | NONCLUSTERED | oui | rgm_service, rgm_imputation, rgm_fidelisation |

