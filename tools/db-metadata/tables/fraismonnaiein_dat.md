# fraismonnaiein_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fra_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `fra_devise` | nvarchar | 3 | non |  | 0 |
| 3 | `fra_mop` | nvarchar | 4 | non |  | 0 |
| 4 | `fra_pourcentage` | float | 53 | non |  | 0 |
| 5 | `fra_montant` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fraismonnaiein_dat_IDX_1 | NONCLUSTERED | oui | fra_societe, fra_devise, fra_mop |

