# hist_ecrit_compt_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hcte_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `hcte_compte_gm` | int | 10 | non |  | 0 |
| 3 | `hcte_filiation` | int | 10 | non |  | 0 |
| 4 | `hcte_imputation` | float | 53 | non |  | 0 |
| 5 | `hcte_sous_imputation` | int | 10 | non |  | 0 |
| 6 | `hcte_libelle` | nvarchar | 20 | oui |  | 0 |
| 7 | `hcte_libelle_supplem` | nvarchar | 20 | oui |  | 0 |
| 8 | `hcte_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `hcte_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `hcte_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `hcte_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `hcte_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `hcte_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `hcte_montant` | float | 53 | non |  | 0 |
| 15 | `hcte_date_comptable` | char | 8 | non |  | 0 |
| 16 | `hcte_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `hcte_heure_operation` | char | 6 | non |  | 0 |
| 18 | `hcte_nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `hcte_flag_hotesses` | nvarchar | 1 | non |  | 0 |
| 20 | `hcte_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `hcte_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_339` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| hist_ecrit_compt_dat_IDX_4 | NONCLUSTERED | non | hcte_societe, hcte_date_comptable, hcte_code_type |
| hist_ecrit_compt_dat_IDX_1 | NONCLUSTERED | non | hcte_societe, hcte_compte_gm, hcte_date_d_operation, hcte_heure_operation |
| hist_ecrit_compt_dat_IDX_2 | NONCLUSTERED | non | hcte_societe, hcte_compte_gm, hcte_filiation, hcte_date_d_operation, hcte_heure_operation |
| hist_ecrit_compt_dat_IDX_5 | NONCLUSTERED | non | hcte_societe, hcte_date_comptable, hcte_operateur, hcte_code_type |
| hist_ecrit_compt_dat_IDX_6 | NONCLUSTERED | oui | RowId_339 |
| hist_ecrit_compt_dat_IDX_3 | NONCLUSTERED | non | hcte_societe, hcte_compte_gm, hcte_code_type, hcte_date_d_operation, hcte_heure_operation |

