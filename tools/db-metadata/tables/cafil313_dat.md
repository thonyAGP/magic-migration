# cafil313_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cmt_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `cmt_code_gm` | int | 10 | non |  | 0 |
| 3 | `cmt_filiation` | int | 10 | non |  | 0 |
| 4 | `cmt_commentaire` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil313_dat_IDX_1 | NONCLUSTERED | oui | cmt_societe, cmt_code_gm, cmt_filiation |

