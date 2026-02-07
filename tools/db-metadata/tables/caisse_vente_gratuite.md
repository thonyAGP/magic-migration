# caisse_vente_gratuite

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 27 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ctg_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `ctg_compte_gm` | int | 10 | non |  | 0 |
| 3 | `ctg_filiation` | int | 10 | non |  | 0 |
| 4 | `ctg_imputation` | float | 53 | non |  | 0 |
| 5 | `ctg_sous_imputation` | int | 10 | non |  | 0 |
| 6 | `ctg_libelle` | nvarchar | 20 | oui |  | 0 |
| 7 | `ctg_libelle_supplem` | nvarchar | 20 | oui |  | 0 |
| 8 | `ctg_credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `ctg_flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `ctg_code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `ctg_numero_chrono` | int | 10 | non |  | 0 |
| 12 | `ctg_avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `ctg_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `ctg_montant` | float | 53 | non |  | 0 |
| 15 | `ctg_date_comptable` | char | 8 | non |  | 0 |
| 16 | `ctg_date_d_operation` | char | 8 | non |  | 0 |
| 17 | `ctg_heure_operation` | char | 6 | non |  | 0 |
| 18 | `ctg_nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `ctg_flag_hotesses` | nvarchar | 1 | non |  | 0 |
| 20 | `ctg_type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `ctg_operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_264` | int | 10 | non |  | 0 |
| 23 | `ctg_id_ligne_annulation` | int | 10 | non |  | 0 |
| 24 | `ctg_num_ticket` | nvarchar | 50 | non |  | 0 |
| 25 | `ctg_num_ligne` | int | 10 | non |  | 0 |
| 26 | `ctg_ref_article` | float | 53 | non |  | 0 |
| 27 | `ctg_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_vente_gratuite_IDX_3 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_code_type, ctg_date_d_operation, ctg_heure_operation |
| caisse_vente_gratuite_IDX_5 | NONCLUSTERED | non | ctg_societe, ctg_date_comptable, ctg_operateur, ctg_code_type |
| caisse_vente_gratuite_IDX_6 | NONCLUSTERED | oui | RowId_264 |
| caisse_vente_gratuite_IDX_4 | NONCLUSTERED | non | ctg_societe, ctg_date_comptable, ctg_code_type |
| caisse_vente_gratuite_IDX_1 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_date_d_operation, ctg_heure_operation |
| caisse_vente_gratuite_IDX_2 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_filiation, ctg_date_d_operation, ctg_heure_operation |

