# tranche_age

**Nom logique Magic** : `tranche_age`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tag_age_mini` | int | 10 | non |  | 0 |
| 2 | `tag_age_maxi` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tranche_age_IDX_1 | NONCLUSTERED | oui | tag_age_mini, tag_age_maxi |

