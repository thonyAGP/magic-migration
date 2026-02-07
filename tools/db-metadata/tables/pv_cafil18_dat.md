# pv_cafil18_dat

| Info | Valeur |
|------|--------|
| Lignes | 6755 |
| Colonnes | 28 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pos_customer_payer_id` | float | 53 | non |  | 1132 |
| 2 | `pos_customer_id` | float | 53 | non |  | 1670 |
| 3 | `pos_package_id_out` | float | 53 | non |  | 6656 |
| 4 | `pos_package_id_in` | float | 53 | non |  | 430 |
| 5 | `cte_filiation` | int | 10 | non |  | 1 |
| 6 | `cte_imputation` | float | 53 | non |  | 17 |
| 7 | `cte_sous_imputation` | int | 10 | non |  | 18 |
| 8 | `cte_libelle` | nvarchar | 20 | oui |  | 222 |
| 9 | `cte_libelle_supplem_` | nvarchar | 20 | oui |  | 2091 |
| 10 | `cte_credit_debit` | nvarchar | 1 | non |  | 2 |
| 11 | `cte_flag_annulation` | nvarchar | 1 | non |  | 2 |
| 12 | `cte_code_type` | nvarchar | 1 | non |  | 2 |
| 13 | `cte_numero_chrono` | int | 10 | non |  | 1 |
| 14 | `cte_avec_change` | nvarchar | 1 | non |  | 1 |
| 15 | `cte_mode_de_paiement` | nvarchar | 4 | non |  | 1 |
| 16 | `cte_montant` | float | 53 | non |  | 674 |
| 17 | `cte_date_comptable` | char | 8 | non |  | 512 |
| 18 | `cte_date_d_operation` | char | 8 | non |  | 513 |
| 19 | `cte_heure_operation` | char | 6 | non |  | 4276 |
| 20 | `cte_nbre_d_articles` | int | 10 | non |  | 20 |
| 21 | `cte_flag_hotesses` | nvarchar | 1 | non |  | 1 |
| 22 | `cte_type_transaction` | nvarchar | 1 | non |  | 1 |
| 23 | `cte_operateur` | nvarchar | 8 | non |  | 19 |
| 24 | `pv_service` | nvarchar | 4 | non |  | 9 |
| 25 | `RowId_377` | int | 10 | non |  | 6755 |
| 26 | `cte_free_extra` | bit |  | non |  | 2 |
| 27 | `cte_montant_free_extra` | float | 53 | non |  | 143 |
| 28 | `pv_vente_en_mobilite` | bit |  | non |  | 2 |

## Valeurs distinctes

### `cte_filiation` (1 valeurs)

```
0
```

### `cte_imputation` (17 valeurs)

```
4.6763e+008, 4.67665e+008, 4.67675e+008, 4.6767e+008, 7.0641e+008, 7.0761e+008, 7.0762e+008
```

### `cte_sous_imputation` (18 valeurs)

```
101, 103, 104, 105, 109, 112, 114, 121, 122, 126, 128, 131, 132, 14, 17, 18, 7, 8
```

### `cte_credit_debit` (2 valeurs)

```
C, D
```

### `cte_flag_annulation` (2 valeurs)

```
A, N
```

### `cte_code_type` (2 valeurs)

```
, O
```

### `cte_numero_chrono` (1 valeurs)

```
0
```

### `cte_nbre_d_articles` (20 valeurs)

```
1, -1, 10, 11, 12, 15, 17, 2, -2, 20, 3, -3, 4, -4, 5, -5, 6, 7, 8, -8
```

### `cte_flag_hotesses` (1 valeurs)

```
M
```

### `cte_operateur` (19 valeurs)

```
ASSTFAM, BAR1, BAR3, BARMGR, BTQ, BTQMGR, EXC, EXCMGR, FAM, FAMILLE, NURSE, PRAKBAR, REST, SCUBA, SPA, SPA1, SPA2, SPA3, SPAMGR
```

### `pv_service` (9 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, REST, SPNA
```

### `cte_free_extra` (2 valeurs)

```
0, 1
```

### `pv_vente_en_mobilite` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_cafil18_dat_IDX_6 | NONCLUSTERED | oui | RowId_377 |
| pv_cafil18_dat_IDX_5 | NONCLUSTERED | non | pv_service, cte_date_comptable, cte_operateur, cte_code_type |
| pv_cafil18_dat_IDX_2 | NONCLUSTERED | non | pv_service, pos_customer_payer_id, pos_package_id_out |
| pv_cafil18_dat_IDX_1 | NONCLUSTERED | non | pv_service, pos_customer_payer_id, cte_date_d_operation, cte_heure_operation |
| pv_cafil18_dat_IDX_4 | NONCLUSTERED | non | pv_service, cte_date_comptable, cte_code_type |
| pv_cafil18_dat_IDX_3 | NONCLUSTERED | non | pv_service, pos_customer_payer_id, cte_code_type, cte_date_d_operation, cte_heure_operation |

