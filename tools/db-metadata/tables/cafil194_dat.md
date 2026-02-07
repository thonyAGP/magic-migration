# cafil194_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cha_num_serie` | int | 10 | non |  | 0 |
| 2 | `cha_date_comptable` | char | 8 | non |  | 0 |
| 3 | `cha_date` | char | 8 | non |  | 0 |
| 4 | `cha_heure` | char | 6 | non |  | 0 |
| 5 | `cha_montant` | float | 53 | non |  | 0 |
| 6 | `cha_societe` | nvarchar | 1 | non |  | 0 |
| 7 | `cha_compte` | int | 10 | non |  | 0 |
| 8 | `cha_filiation` | int | 10 | non |  | 0 |
| 9 | `cha_moyen_de_paiemen` | nvarchar | 4 | non |  | 0 |
| 10 | `cha_user` | nvarchar | 8 | non |  | 0 |
| 11 | `RowId_180` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil194_dat_IDX_5 | NONCLUSTERED | oui | RowId_180 |
| cafil194_dat_IDX_1 | NONCLUSTERED | non | cha_societe, cha_date_comptable, cha_moyen_de_paiemen, cha_user, cha_date, cha_heure |
| cafil194_dat_IDX_3 | NONCLUSTERED | non | cha_societe, cha_compte, cha_filiation |
| cafil194_dat_IDX_4 | NONCLUSTERED | non | cha_societe, cha_date_comptable, cha_user, cha_moyen_de_paiemen |
| cafil194_dat_IDX_2 | NONCLUSTERED | non | cha_societe, cha_num_serie |

