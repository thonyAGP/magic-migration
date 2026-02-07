# excupar_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 17 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `par_excursion_type` | nvarchar | 1 | non |  | 0 |
| 2 | `par_excursion_code` | int | 10 | non |  | 0 |
| 3 | `par_excursion_date` | char | 8 | non |  | 0 |
| 4 | `par_nom` | nvarchar | 15 | non |  | 0 |
| 5 | `par_prenom` | nvarchar | 8 | non |  | 0 |
| 6 | `par_societe` | nvarchar | 1 | non |  | 0 |
| 7 | `par_code_gm` | int | 10 | non |  | 0 |
| 8 | `par_filiation` | int | 10 | non |  | 0 |
| 9 | `par_prix_unitaire` | float | 53 | non |  | 0 |
| 10 | `par_remise` | float | 53 | non |  | 0 |
| 11 | `par_supplement` | float | 53 | non |  | 0 |
| 12 | `par_montant_total` | float | 53 | non |  | 0 |
| 13 | `par_flag_terminal` | int | 10 | non |  | 0 |
| 14 | `par_chrono` | int | 10 | non |  | 0 |
| 15 | `par_annule` | nvarchar | 1 | non |  | 0 |
| 16 | `RowId_298` | int | 10 | non |  | 0 |
| 17 | `par_flag_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excupar_dat_IDX_2 | NONCLUSTERED | non | par_flag_terminal, par_flag_hostname, par_excursion_type, par_excursion_code, par_excursion_date, par_nom |
| excupar_dat_IDX_1 | NONCLUSTERED | non | par_excursion_type, par_excursion_code, par_excursion_date, par_nom, par_prenom |
| excupar_dat_IDX_3 | NONCLUSTERED | non | par_chrono, par_excursion_type, par_excursion_code, par_excursion_date, par_nom, par_prenom |
| excupar_dat_IDX_4 | NONCLUSTERED | non | par_excursion_type, par_excursion_code, par_excursion_date, par_societe, par_code_gm, par_filiation |
| excupar_dat_IDX_5 | NONCLUSTERED | oui | RowId_298 |

