# corrarticle_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cart_code_article` | int | 10 | non |  | 0 |
| 2 | `cart_code_datagram` | int | 10 | non |  | 0 |
| 3 | `cart_libelle_article` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| corrarticle_dat_IDX_2 | NONCLUSTERED | non | cart_code_datagram |
| corrarticle_dat_IDX_1 | NONCLUSTERED | oui | cart_code_article |

