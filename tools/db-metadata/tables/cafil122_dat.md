# cafil122_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 16 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mk3_traite_status` | nvarchar | 1 | non |  | 0 |
| 2 | `mk3_num_transac_` | int | 10 | non |  | 0 |
| 3 | `mk3_traite_date` | char | 8 | non |  | 0 |
| 4 | `mk3_traite_heure` | char | 6 | non |  | 0 |
| 5 | `mk3_date_transaction` | char | 8 | non |  | 0 |
| 6 | `mk3_time_transaction` | char | 6 | non |  | 0 |
| 7 | `mk3_numero` | int | 10 | non |  | 0 |
| 8 | `mk3_ticket` | int | 10 | non |  | 0 |
| 9 | `mk3_num_de_serie` | int | 10 | non |  | 0 |
| 10 | `mk3_code_vendeur` | int | 10 | non |  | 0 |
| 11 | `mk3_nb_d_occurence` | int | 10 | non |  | 0 |
| 12 | `mk3_signe` | nvarchar | 1 | non |  | 0 |
| 13 | `mk3_non_exploite` | nvarchar | 1 | non |  | 0 |
| 14 | `mk3_auto_commutateur` | int | 10 | non |  | 0 |
| 15 | `mk3_forfait` | int | 10 | non |  | 0 |
| 16 | `mk3_reste` | nvarchar | 216 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil122_dat_IDX_2 | NONCLUSTERED | non | mk3_traite_status |
| cafil122_dat_IDX_1 | NONCLUSTERED | oui | mk3_date_transaction, mk3_time_transaction, mk3_numero, mk3_ticket, mk3_num_de_serie |

