# cafil141_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tbi_traite_status` | nvarchar | 1 | non |  | 0 |
| 2 | `tbi_traite_date` | char | 8 | non |  | 0 |
| 3 | `tbi_traite_heure` | char | 6 | non |  | 0 |
| 4 | `tbi_prefixe_d_acces` | nvarchar | 2 | non |  | 0 |
| 5 | `tbi_code_confident_` | int | 10 | non |  | 0 |
| 6 | `tbi_date_debut` | char | 8 | non |  | 0 |
| 7 | `tbi_heure_debut` | char | 6 | non |  | 0 |
| 8 | `tbi_nbre_de_taxe` | int | 10 | non |  | 0 |
| 9 | `tbi_num_borne__ligne_` | nvarchar | 6 | non |  | 0 |
| 10 | `tbi_num_poste` | int | 10 | non |  | 0 |
| 11 | `tbi_num_compose` | nvarchar | 23 | non |  | 0 |
| 12 | `tbi_cout_taxe_1` | float | 53 | non |  | 0 |
| 13 | `tbi_cout_taxe_2` | float | 53 | non |  | 0 |
| 14 | `tbi_cout_taxe_3` | float | 53 | non |  | 0 |
| 15 | `tbi_duree` | char | 6 | non |  | 0 |
| 16 | `tbi_pays_appele` | nvarchar | 20 | non |  | 0 |
| 17 | `tbi_centre_terrestre` | nvarchar | 8 | non |  | 0 |
| 18 | `tbi_transfert` | int | 10 | non |  | 0 |
| 19 | `tbi_compteur` | nvarchar | 4 | non |  | 0 |
| 20 | `tbi_champs_reserve` | nvarchar | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil141_dat_IDX_1 | NONCLUSTERED | oui | tbi_date_debut, tbi_heure_debut, tbi_code_confident_, tbi_num_borne__ligne_, tbi_num_poste, tbi_compteur |
| cafil141_dat_IDX_2 | NONCLUSTERED | non | tbi_traite_status |

