# cafil040_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `stv_code_vendeur` | int | 10 | non |  | 0 |
| 2 | `stv_code_article` | int | 10 | non |  | 0 |
| 3 | `stv_quantite` | int | 10 | non |  | 0 |
| 4 | `stv_date_cloture` | char | 8 | non |  | 0 |
| 5 | `stv_heure_cloture` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil040_dat_IDX_1 | NONCLUSTERED | oui | stv_code_vendeur, stv_code_article |

