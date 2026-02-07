# taxe_add_param

**Nom logique Magic** : `taxe_add_param`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tap_id` | int | 10 | non |  | 0 |
| 2 | `tap_appli` | char | 1 | non |  | 0 |
| 3 | `tap_cat` | int | 10 | non |  | 0 |
| 4 | `tap_subcat` | int | 10 | non |  | 0 |
| 5 | `tap_article` | int | 10 | non |  | 0 |
| 6 | `tap_taxe` | float | 53 | non |  | 0 |
| 7 | `tap_portee` | char | 3 | non |  | 0 |
| 8 | `tap_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taxe_add_param_IDX_1 | NONCLUSTERED | oui | tap_id |

