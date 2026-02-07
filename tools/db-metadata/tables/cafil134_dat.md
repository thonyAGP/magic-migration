# cafil134_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 24 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `err_date` | char | 8 | non |  | 0 |
| 2 | `err_heure` | char | 6 | non |  | 0 |
| 3 | `err_numero` | int | 10 | non |  | 0 |
| 4 | `err_qui_genere` | nvarchar | 1 | non |  | 0 |
| 5 | `err_traite_status` | nvarchar | 1 | non |  | 0 |
| 6 | `err_traite_date` | char | 8 | non |  | 0 |
| 7 | `err_traite_heure` | char | 6 | non |  | 0 |
| 8 | `err_prefixe_d_acces` | nvarchar | 2 | non |  | 0 |
| 9 | `err_code_confident_` | int | 10 | non |  | 0 |
| 10 | `err_date_debut` | char | 8 | non |  | 0 |
| 11 | `err_heure_debut` | char | 6 | non |  | 0 |
| 12 | `err_nbre_de_taxe` | int | 10 | non |  | 0 |
| 13 | `err_num_ligne` | int | 10 | non |  | 0 |
| 14 | `err_num_poste` | int | 10 | non |  | 0 |
| 15 | `err_num_compose` | nvarchar | 23 | non |  | 0 |
| 16 | `err_cout_taxe_1` | float | 53 | non |  | 0 |
| 17 | `err_cout_taxe_2` | float | 53 | non |  | 0 |
| 18 | `err_cout_taxe_3` | float | 53 | non |  | 0 |
| 19 | `err_duree` | char | 6 | non |  | 0 |
| 20 | `err_pays_appele` | nvarchar | 20 | non |  | 0 |
| 21 | `err_centre_terrestre` | nvarchar | 8 | non |  | 0 |
| 22 | `err_transfert` | int | 10 | non |  | 0 |
| 23 | `err_champs_reserve` | nvarchar | 14 | non |  | 0 |
| 24 | `RowId_156` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil134_dat_IDX_2 | NONCLUSTERED | oui | RowId_156 |
| cafil134_dat_IDX_1 | NONCLUSTERED | non | err_date, err_heure, err_numero |

