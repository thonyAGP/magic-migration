# cafil197_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ich_num_serie` | int | 10 | non |  | 0 |
| 2 | `ich_date` | char | 8 | non |  | 0 |
| 3 | `ich_heure` | char | 6 | non |  | 0 |
| 4 | `ich_montant` | float | 53 | non |  | 0 |
| 5 | `ich_societe` | nvarchar | 1 | non |  | 0 |
| 6 | `ich_compte` | int | 10 | non |  | 0 |
| 7 | `ich_filiation` | int | 10 | non |  | 0 |
| 8 | `ich_moyen_de_paiemen` | nvarchar | 4 | non |  | 0 |
| 9 | `ich_user` | nvarchar | 8 | non |  | 0 |
| 10 | `RowId_183` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil197_dat_IDX_1 | NONCLUSTERED | non | ich_societe, ich_num_serie |
| cafil197_dat_IDX_2 | NONCLUSTERED | oui | RowId_183 |

