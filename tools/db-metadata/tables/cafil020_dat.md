# cafil020_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dda_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `dda_compte_gm` | int | 10 | non |  | 0 |
| 3 | `dda_date_operation` | char | 8 | non |  | 0 |
| 4 | `dda_heure_operation` | char | 6 | non |  | 0 |
| 5 | `dda_code_devise` | nvarchar | 3 | non |  | 0 |
| 6 | `dda_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 7 | `dda_depot_retrait` | nvarchar | 1 | non |  | 0 |
| 8 | `dda_quantite` | float | 53 | non |  | 0 |
| 9 | `dda_couple_change` | nvarchar | 1 | non |  | 0 |
| 10 | `dda_operateur` | nvarchar | 8 | non |  | 0 |
| 11 | `RowId_42` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil020_dat_IDX_3 | NONCLUSTERED | oui | RowId_42 |
| cafil020_dat_IDX_1 | NONCLUSTERED | non | dda_societe, dda_compte_gm, dda_date_operation, dda_heure_operation, dda_operateur |
| cafil020_dat_IDX_2 | NONCLUSTERED | non | dda_societe, dda_compte_gm, dda_code_devise, dda_mode_paiement |

