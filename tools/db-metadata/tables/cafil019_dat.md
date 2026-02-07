# cafil019_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `doa_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `doa_code_gm` | int | 10 | non |  | 0 |
| 3 | `doa_encore_depose` | nvarchar | 1 | non |  | 0 |
| 4 | `doa_date_depot` | char | 8 | non |  | 0 |
| 5 | `doa_heure_depot` | char | 6 | non |  | 0 |
| 6 | `doa_date_retrait` | char | 8 | non |  | 0 |
| 7 | `doa_heure_retrait` | char | 6 | non |  | 0 |
| 8 | `doa_descriptif_1` | nvarchar | 16 | non |  | 0 |
| 9 | `doa_descriptif_2` | nvarchar | 19 | non |  | 0 |
| 10 | `doa_operateur` | nvarchar | 8 | non |  | 0 |
| 11 | `RowId_41` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil019_dat_IDX_3 | NONCLUSTERED | oui | RowId_41 |
| cafil019_dat_IDX_1 | NONCLUSTERED | non | doa_societe, doa_code_gm, doa_encore_depose, doa_date_depot, doa_heure_depot, doa_descriptif_1 |
| cafil019_dat_IDX_2 | NONCLUSTERED | non | doa_societe, doa_code_gm, doa_date_depot, doa_heure_depot, doa_operateur |

