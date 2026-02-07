# cafil125_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chg_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `chg_ident_operation` | int | 10 | non |  | 0 |
| 3 | `chg_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 4 | `chg_change_gm__o_n_` | nvarchar | 1 | non |  | 0 |
| 5 | `chg_operat__liee` | int | 10 | non |  | 0 |
| 6 | `chg_code_gm` | int | 10 | non |  | 0 |
| 7 | `chg_filiation` | int | 10 | non |  | 0 |
| 8 | `chg_date_comptable` | char | 8 | non |  | 0 |
| 9 | `chg_date_operation` | char | 8 | non |  | 0 |
| 10 | `chg_heure_operation` | char | 6 | non |  | 0 |
| 11 | `chg_code_devise` | nvarchar | 3 | non |  | 0 |
| 12 | `chg_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 13 | `chg_quantite` | float | 53 | non |  | 0 |
| 14 | `chg_taux_change` | float | 53 | non |  | 0 |
| 15 | `chg_depuis_depot` | nvarchar | 1 | non |  | 0 |
| 16 | `chg_lie_a_versement` | nvarchar | 1 | non |  | 0 |
| 17 | `chg_type_de_devise` | int | 10 | non |  | 0 |
| 18 | `chg_operateur` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil125_dat_IDX_1 | NONCLUSTERED | oui | chg_societe, chg_ident_operation |
| cafil125_dat_IDX_2 | NONCLUSTERED | non | chg_societe, chg_code_gm, chg_date_operation, chg_heure_operation |
| cafil125_dat_IDX_4 | NONCLUSTERED | non | chg_societe, chg_change_gm__o_n_, chg_ident_operation |
| cafil125_dat_IDX_5 | NONCLUSTERED | non | chg_societe, chg_code_gm, chg_filiation |
| cafil125_dat_IDX_6 | NONCLUSTERED | non | chg_societe, chg_date_comptable, chg_operateur, chg_code_devise, chg_mode_paiement |
| cafil125_dat_IDX_3 | NONCLUSTERED | non | chg_societe, chg_date_comptable, chg_code_devise, chg_mode_paiement, chg_date_operation, chg_heure_operation |

