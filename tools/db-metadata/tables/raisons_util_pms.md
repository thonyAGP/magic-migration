# raisons_util_pms

**Nom logique Magic** : `raisons_util_pms`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rup_id` | int | 10 | non |  | 0 |
| 2 | `rup_langue` | char | 3 | non |  | 0 |
| 3 | `rup_app` | char | 3 | non |  | 0 |
| 4 | `rup_code` | nvarchar | 10 | non |  | 0 |
| 5 | `rup_label` | nvarchar | 50 | non |  | 0 |
| 6 | `rup_id_parent` | int | 10 | non |  | 0 |
| 7 | `rup_comment_needed` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| raisons_util_pms_IDX_1 | NONCLUSTERED | oui | rup_id |

