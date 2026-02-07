# fraissurchange_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fchg_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `fchg_ident_operation` | int | 10 | non |  | 0 |
| 3 | `fchg_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 4 | `fchg_change_gm__o_n_` | nvarchar | 1 | non |  | 0 |
| 5 | `fchg_operat__liee` | int | 10 | non |  | 0 |
| 6 | `fchg_code_gm` | int | 10 | non |  | 0 |
| 7 | `fchg_filiation` | int | 10 | non |  | 0 |
| 8 | `fchg_date_comptable` | char | 8 | non |  | 0 |
| 9 | `fchg_date_operation` | char | 8 | non |  | 0 |
| 10 | `fchg_heure_operation` | char | 6 | non |  | 0 |
| 11 | `fchg_code_devise` | nvarchar | 3 | non |  | 0 |
| 12 | `fchg_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 13 | `fchg_quantite_change` | float | 53 | non |  | 0 |
| 14 | `fchg___frais_change` | float | 53 | non |  | 0 |
| 15 | `fchg_montant_fixe_frais` | float | 53 | non |  | 0 |
| 16 | `fchg_montant_frais` | float | 53 | non |  | 0 |
| 17 | `fchg_lie_a_versement` | nvarchar | 1 | non |  | 0 |
| 18 | `fchg_operateur` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fraissurchange_dat_IDX_3 | NONCLUSTERED | non | fchg_societe, fchg_date_comptable, fchg_code_devise, fchg_mode_paiement, fchg_date_operation, fchg_heure_operation |
| fraissurchange_dat_IDX_1 | NONCLUSTERED | oui | fchg_societe, fchg_ident_operation |
| fraissurchange_dat_IDX_2 | NONCLUSTERED | non | fchg_societe, fchg_code_gm, fchg_date_operation, fchg_heure_operation |
| fraissurchange_dat_IDX_5 | NONCLUSTERED | non | fchg_societe, fchg_code_gm, fchg_filiation |
| fraissurchange_dat_IDX_6 | NONCLUSTERED | non | fchg_societe, fchg_date_comptable, fchg_operateur, fchg_code_devise, fchg_mode_paiement |
| fraissurchange_dat_IDX_4 | NONCLUSTERED | non | fchg_societe, fchg_change_gm__o_n_, fchg_ident_operation |

