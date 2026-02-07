# cafil034_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mks_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mks_date_compt___new` | char | 8 | non |  | 0 |
| 3 | `mks_solde_caisse_new` | float | 53 | non |  | 0 |
| 4 | `mks_date_compt___old` | char | 8 | non |  | 0 |
| 5 | `mks_solde_caisse_old` | float | 53 | non |  | 0 |
| 6 | `mks_date_operation` | char | 8 | non |  | 0 |
| 7 | `mks_heure_operation` | char | 6 | non |  | 0 |
| 8 | `mks_user` | nvarchar | 8 | non |  | 0 |
| 9 | `mks_flag_edition` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil034_dat_IDX_2 | NONCLUSTERED | non | mks_societe, mks_flag_edition |
| cafil034_dat_IDX_1 | NONCLUSTERED | oui | mks_societe, mks_date_compt___new |

