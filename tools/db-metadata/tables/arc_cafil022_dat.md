# arc_cafil022_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `arc_chg_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `arc_chg_ident_operation` | int | 10 | non |  | 0 |
| 3 | `arc_chg_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 4 | `arc_chg_change_gm__o_n_` | nvarchar | 1 | non |  | 0 |
| 5 | `arc_chg_operat__liee` | int | 10 | non |  | 0 |
| 6 | `arc_chg_code_gm` | int | 10 | non |  | 0 |
| 7 | `arc_chg_filiation` | int | 10 | non |  | 0 |
| 8 | `arc_chg_date_comptable` | char | 8 | non |  | 0 |
| 9 | `arc_chg_date_operation` | char | 8 | non |  | 0 |
| 10 | `arc_chg_heure_operation` | char | 6 | non |  | 0 |
| 11 | `arc_chg_code_devise` | nvarchar | 3 | non |  | 0 |
| 12 | `arc_chg_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 13 | `arc_chg_quantite` | float | 53 | non |  | 0 |
| 14 | `arc_chg_taux_change` | float | 53 | non |  | 0 |
| 15 | `arc_chg_depuis_depot` | nvarchar | 1 | non |  | 0 |
| 16 | `arc_chg_lie_a_versement` | nvarchar | 1 | non |  | 0 |
| 17 | `arc_chg_operateur` | nvarchar | 8 | non |  | 0 |
| 18 | `arc_chg_date_purge` | char | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| arc_cafil022_dat_IDX_4 | NONCLUSTERED | non | arc_chg_societe, arc_chg_change_gm__o_n_, arc_chg_ident_operation, arc_chg_date_purge |
| arc_cafil022_dat_IDX_1 | NONCLUSTERED | oui | arc_chg_societe, arc_chg_ident_operation, arc_chg_date_purge |
| arc_cafil022_dat_IDX_2 | NONCLUSTERED | non | arc_chg_societe, arc_chg_code_gm, arc_chg_date_operation, arc_chg_heure_operation, arc_chg_date_purge |
| arc_cafil022_dat_IDX_5 | NONCLUSTERED | non | arc_chg_societe, arc_chg_code_gm, arc_chg_filiation, arc_chg_date_purge |
| arc_cafil022_dat_IDX_6 | NONCLUSTERED | non | arc_chg_societe, arc_chg_date_comptable, arc_chg_operateur, arc_chg_code_devise, arc_chg_mode_paiement, arc_chg_date_purge |
| arc_cafil022_dat_IDX_3 | NONCLUSTERED | non | arc_chg_societe, arc_chg_date_comptable, arc_chg_code_devise, arc_chg_mode_paiement, arc_chg_date_operation, arc_chg_heure_operation, arc_chg_date_purge |

