# restru18____

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `____societe` | nvarchar | 1 | non |  | 0 |
| 2 | `____compte_gm` | int | 10 | non |  | 0 |
| 3 | `____filiation` | int | 10 | non |  | 0 |
| 4 | `____imputation` | float | 53 | non |  | 0 |
| 5 | `____sous_imputation` | int | 10 | non |  | 0 |
| 6 | `____libelle` | nvarchar | 15 | non |  | 0 |
| 7 | `____libelle_supplem` | nvarchar | 15 | non |  | 0 |
| 8 | `____credit_debit` | nvarchar | 1 | non |  | 0 |
| 9 | `____flag_annulation` | nvarchar | 1 | non |  | 0 |
| 10 | `____code_type` | nvarchar | 1 | non |  | 0 |
| 11 | `____numero_chrono` | int | 10 | non |  | 0 |
| 12 | `____avec_change` | nvarchar | 1 | non |  | 0 |
| 13 | `____mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 14 | `____montant` | float | 53 | non |  | 0 |
| 15 | `____date_comptable` | char | 8 | non |  | 0 |
| 16 | `____date_d_operation` | char | 8 | non |  | 0 |
| 17 | `____heure_operation` | char | 6 | non |  | 0 |
| 18 | `____nbre_d_articles` | int | 10 | non |  | 0 |
| 19 | `____flag_hotesses` | nvarchar | 1 | non |  | 0 |
| 20 | `____type_transaction` | nvarchar | 1 | non |  | 0 |
| 21 | `____operateur` | nvarchar | 8 | non |  | 0 |
| 22 | `RowId_452` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| restru18_____IDX_4 | NONCLUSTERED | non | ____societe, ____date_comptable, ____code_type |
| restru18_____IDX_1 | NONCLUSTERED | non | ____societe, ____compte_gm, ____date_d_operation, ____heure_operation |
| restru18_____IDX_3 | NONCLUSTERED | non | ____societe, ____compte_gm, ____code_type, ____date_d_operation, ____heure_operation |
| restru18_____IDX_2 | NONCLUSTERED | non | ____societe, ____compte_gm, ____filiation, ____date_d_operation, ____heure_operation |
| restru18_____IDX_6 | NONCLUSTERED | oui | RowId_452 |
| restru18_____IDX_5 | NONCLUSTERED | non | ____societe, ____date_comptable, ____operateur, ____code_type |

