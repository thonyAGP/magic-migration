# escale_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `d_escale` | char | 8 | non |  | 0 |
| 2 | `escale` | nvarchar | 20 | non |  | 0 |
| 3 | `h_arrive` | char | 6 | non |  | 0 |
| 4 | `h_depart` | char | 6 | non |  | 0 |
| 5 | `n_croisier` | float | 53 | non |  | 0 |
| 6 | `notes` | nvarchar | 20 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| escale_dat_IDX_1 | NONCLUSTERED | oui | d_escale |

