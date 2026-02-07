# cafil198_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `taf_num_terminal` | int | 10 | non |  | 0 |
| 2 | `taf_num_serie` | int | 10 | non |  | 0 |
| 3 | `taf_date` | char | 8 | non |  | 0 |
| 4 | `taf_heure` | char | 6 | non |  | 0 |
| 5 | `taf_montant` | float | 53 | non |  | 0 |
| 6 | `taf_moyen_de_paiemen` | nvarchar | 4 | non |  | 0 |
| 7 | `taf_user` | nvarchar | 8 | non |  | 0 |
| 8 | `taf_num_machine` | int | 10 | non |  | 0 |
| 9 | `RowId_184` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil198_dat_IDX_1 | NONCLUSTERED | non | taf_num_terminal, taf_num_serie, taf_date |
| cafil198_dat_IDX_2 | NONCLUSTERED | oui | RowId_184 |

