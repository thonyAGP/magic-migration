# cafil058_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `aut_num_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `aut_code_adherent` | int | 10 | non |  | 0 |
| 3 | `aut_filiation` | int | 10 | non |  | 0 |
| 4 | `aut_code_autocom` | int | 10 | non |  | 0 |
| 5 | `aut_ligne_telephone` | int | 10 | non |  | 0 |
| 6 | `aut_poste` | int | 10 | non |  | 0 |
| 7 | `aut_flag_utilise` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil058_dat_IDX_4 | NONCLUSTERED | non | aut_ligne_telephone |
| cafil058_dat_IDX_2 | NONCLUSTERED | non | aut_num_societe, aut_code_adherent, aut_filiation |
| cafil058_dat_IDX_1 | NONCLUSTERED | oui | aut_code_autocom |
| cafil058_dat_IDX_3 | NONCLUSTERED | non | aut_poste |

