# cafil132_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pbx_traite_status` | nvarchar | 1 | non |  | 0 |
| 2 | `pbx_traite_date` | char | 8 | non |  | 0 |
| 3 | `pbx_traite_heure` | char | 6 | non |  | 0 |
| 4 | `pbx_prefixe_d_acces` | nvarchar | 2 | non |  | 0 |
| 5 | `pbx_code_confident_` | int | 10 | non |  | 0 |
| 6 | `pbx_date_debut` | char | 8 | non |  | 0 |
| 7 | `pbx_heure_debut` | char | 6 | non |  | 0 |
| 8 | `pbx_nbre_de_taxe` | int | 10 | non |  | 0 |
| 9 | `pbx_num_ligne` | int | 10 | non |  | 0 |
| 10 | `pbx_num_poste` | int | 10 | non |  | 0 |
| 11 | `pbx_num_compose` | nvarchar | 23 | non |  | 0 |
| 12 | `pbx_cout_taxe_1` | float | 53 | non |  | 0 |
| 13 | `pbx_cout_taxe_2` | float | 53 | non |  | 0 |
| 14 | `pbx_cout_taxe_3` | float | 53 | non |  | 0 |
| 15 | `pbx_duree` | char | 6 | non |  | 0 |
| 16 | `pbx_pays_appele` | nvarchar | 20 | non |  | 0 |
| 17 | `pbx_centre_terrestre` | nvarchar | 8 | non |  | 0 |
| 18 | `pbx_transfert` | int | 10 | non |  | 0 |
| 19 | `pbx_champs_reserve` | nvarchar | 14 | non |  | 0 |
| 20 | `RowId_154` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil132_dat_IDX_3 | NONCLUSTERED | oui | RowId_154 |
| cafil132_dat_IDX_1 | NONCLUSTERED | non | pbx_date_debut, pbx_heure_debut, pbx_code_confident_, pbx_num_ligne, pbx_num_poste |
| cafil132_dat_IDX_2 | NONCLUSTERED | non | pbx_traite_status |

