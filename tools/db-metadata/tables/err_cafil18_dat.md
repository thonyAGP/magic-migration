# err_cafil18_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ecte_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `ecte_compte_gm` | int | 10 | non |  | 0 |
| 3 | `ecte_filiation` | int | 10 | non |  | 0 |
| 4 | `ecte_imputation` | float | 53 | non |  | 0 |
| 5 | `ecte_sous_imputation` | int | 10 | non |  | 0 |
| 6 | `ecte_libelle` | nvarchar | 20 | oui |  | 0 |
| 7 | `ecte_libelle_supplem` | nvarchar | 20 | oui |  | 0 |
| 8 | `ecte_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `ecte_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `ecte_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `ecte_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `ecte_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `ecte_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `ecte_montant` | float | 53 | non |  | 0 |
| 15 | `ecte_date_comptable` | char | 8 | non |  | 0 |
| 16 | `ecte_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `ecte_heure_operation` | char | 6 | non |  | 0 |
| 18 | `ecte_nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `ecte_flag_application` | nvarchar | 1 | non |  | 0 |
| 20 | `ecte_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `ecte_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_288` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| err_cafil18_dat_IDX_5 | NONCLUSTERED | non | ecte_societe, ecte_date_comptable, ecte_operateur, ecte_code_type |
| err_cafil18_dat_IDX_3 | NONCLUSTERED | non | ecte_societe, ecte_compte_gm, ecte_code_type, ecte_date_d_operation, ecte_heure_operation |
| err_cafil18_dat_IDX_6 | NONCLUSTERED | oui | RowId_288 |
| err_cafil18_dat_IDX_1 | NONCLUSTERED | non | ecte_societe, ecte_compte_gm, ecte_date_d_operation, ecte_heure_operation |
| err_cafil18_dat_IDX_2 | NONCLUSTERED | non | ecte_societe, ecte_compte_gm, ecte_filiation, ecte_date_d_operation, ecte_heure_operation |
| err_cafil18_dat_IDX_4 | NONCLUSTERED | non | ecte_societe, ecte_date_comptable, ecte_code_type |

