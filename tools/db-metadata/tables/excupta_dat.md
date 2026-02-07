# excupta_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dpa_excursion_type` | nvarchar | 1 | non |  | 0 |
| 2 | `dpa_excursion_code` | int | 10 | non |  | 0 |
| 3 | `dpa_excursion_date` | char | 8 | non |  | 0 |
| 4 | `dpa_nom` | nvarchar | 15 | non |  | 0 |
| 5 | `dpa_prenom` | nvarchar | 8 | non |  | 0 |
| 6 | `dpa_societe` | nvarchar | 1 | non |  | 0 |
| 7 | `dpa_code_gm` | int | 10 | non |  | 0 |
| 8 | `dpa_filiation` | int | 10 | non |  | 0 |
| 9 | `dpa_nature` | nvarchar | 4 | non |  | 0 |
| 10 | `dpa_libelle` | nvarchar | 40 | non |  | 0 |
| 11 | `dpa_flag_terminal` | int | 10 | non |  | 0 |
| 12 | `dpa_chrono` | int | 10 | non |  | 0 |
| 13 | `dpa_annule` | nvarchar | 1 | non |  | 0 |
| 14 | `RowId_301` | int | 10 | non |  | 0 |
| 15 | `dpa_flag_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excupta_dat_IDX_2 | NONCLUSTERED | non | dpa_chrono, dpa_excursion_type, dpa_excursion_code, dpa_excursion_date, dpa_societe, dpa_code_gm, dpa_filiation, dpa_nature |
| excupta_dat_IDX_3 | NONCLUSTERED | oui | RowId_301 |
| excupta_dat_IDX_1 | NONCLUSTERED | non | dpa_chrono, dpa_excursion_type, dpa_excursion_code, dpa_excursion_date, dpa_nom, dpa_prenom, dpa_nature |

