# cafil018_dat

| Info | Valeur |
|------|--------|
| Lignes | 9349 |
| Colonnes | 47 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cte_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `cte_compte_gm` | int | 10 | non |  | 918 |
| 3 | `cte_filiation` | int | 10 | non |  | 9 |
| 4 | `cte_imputation` | float | 53 | non |  | 38 |
| 5 | `cte_sous_imputation` | int | 10 | non |  | 24 |
| 6 | `cte_libelle` | nvarchar | 20 | oui |  | 1535 |
| 7 | `cte_libelle_supplem_` | nvarchar | 20 | oui |  | 1424 |
| 8 | `cte_credit_debit` | nvarchar | 1 | non |  | 2 |
| 9 | `cte_flag_annulation` | nvarchar | 1 | non |  | 3 |
| 10 | `cte_code_type` | nvarchar | 1 | non |  | 3 |
| 11 | `cte_numero_chrono` | int | 10 | non |  | 2284 |
| 12 | `cte_avec_change` | nvarchar | 1 | non |  | 2 |
| 13 | `cte_mode_de_paiement` | nvarchar | 4 | non |  | 8 |
| 14 | `cte_montant` | float | 53 | non |  | 1803 |
| 15 | `cte_date_comptable` | char | 8 | non |  | 262 |
| 16 | `cte_date_d_operation` | char | 8 | non |  | 263 |
| 17 | `cte_heure_operation` | char | 6 | non |  | 6642 |
| 18 | `cte_nbre_d_articles` | int | 10 | non |  | 20 |
| 19 | `cte_flag_application` | nvarchar | 1 | non |  | 5 |
| 20 | `cte_type_transaction` | nvarchar | 1 | non |  | 3 |
| 21 | `cte_operateur` | nvarchar | 8 | non |  | 38 |
| 22 | `RowId_40` | int | 10 | non |  | 9349 |
| 23 | `cte_ref_article` | float | 53 | non |  | 3995 |
| 24 | `cte_taux_tva` | float | 53 | non |  | 2 |
| 25 | `cte_no_facture` | float | 53 | non |  | 71 |
| 26 | `cte_service` | nvarchar | 4 | non |  | 16 |
| 27 | `cte_montant_remise` | float | 53 | non |  | 84 |
| 28 | `cte_id_transaction` | nvarchar | 32 | oui |  | 1 |
| 29 | `cte_id_acceptation` | nvarchar | 32 | oui |  | 2 |
| 30 | `cte_free_extra` | bit |  | non |  | 2 |
| 31 | `cte_montant_free_extra` | float | 53 | non |  | 284 |
| 32 | `cte_num_terminal_vente` | int | 10 | non |  | 28 |
| 33 | `cte_activite_comptable` | int | 10 | non |  | 6 |
| 34 | `cte_id_ligne_annulation` | int | 10 | non |  | 380 |
| 35 | `cte_num_cheque` | nvarchar | 30 | non |  | 1 |
| 36 | `cte_type_art` | nvarchar | 6 | non |  | 4 |
| 37 | `cte_stype_art` | nvarchar | 6 | non |  | 2 |
| 38 | `cte_login_vendeur` | nvarchar | 8 | non |  | 14 |
| 39 | `cte_matricule` | nvarchar | 30 | non |  | 2 |
| 40 | `cte_type_credit` | nvarchar | 2 | non |  | 2 |
| 41 | `cte_commentaire_annulation` | nvarchar | 100 | non |  | 42 |
| 42 | `cte_num_tpe` | nvarchar | 20 | non |  | 1 |
| 43 | `cte_num_ticket` | nvarchar | 50 | non |  | 1251 |
| 44 | `cte_num_ligne` | int | 10 | non |  | 15 |
| 45 | `cte_token_id` | nvarchar | 32 | non |  | 1 |
| 46 | `cte_transaction_id` | nvarchar | 32 | non |  | 1 |
| 47 | `cte_no_galaxy_order` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `cte_societe` (1 valeurs)

```
C
```

### `cte_filiation` (9 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 7, 8
```

### `cte_imputation` (38 valeurs)

```
4.252e+008, 4.6754e+008, 4.6763e+008, 4.6765e+008, 4.67665e+008, 4.67675e+008, 4.6767e+008, 5.1131e+008, 5.1132e+008, 5.11331e+008, 5.11332e+008, 5.32188e+008, 5.801e+008, 6.2341e+008, 6.2513e+008, 7.0625e+008, 7.0641e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008, 7.0887e+008
```

### `cte_sous_imputation` (24 valeurs)

```
0, 101, 102, 103, 104, 105, 109, 11, 112, 114, 121, 122, 126, 128, 131, 132, 14, 17, 18, 21, 34, 38, 7, 8
```

### `cte_credit_debit` (2 valeurs)

```
C, D
```

### `cte_flag_annulation` (3 valeurs)

```
A, N, X
```

### `cte_code_type` (3 valeurs)

```
O, S, V
```

### `cte_avec_change` (2 valeurs)

```
, N
```

### `cte_mode_de_paiement` (8 valeurs)

```
, ALIP, AMEX, CASH, CCAU, OD, VISA, WECH
```

### `cte_nbre_d_articles` (20 valeurs)

```
0, 1, -1, 10, 11, 12, 14, 15, 17, 18, 2, -2, 20, 3, -3, 4, -4, 5, 6, 8
```

### `cte_flag_application` (5 valeurs)

```
, A, P, R, W
```

### `cte_type_transaction` (3 valeurs)

```
, C, M
```

### `cte_operateur` (38 valeurs)

```
APPLE, ARKON   , ASSTFAM, AUNKO, BAR1, BARMGR, BEAM, BTQ, BTQMGR, DOREEN, ESTELLE , EVE, EXC, EXCMGR, FAM, FAMILLE, GIFT, JAA, JOLIE, JULIA, MICKY, MIND, NURSE, OpenBrav, OPENBRAV, PLANNING, PRAKBAR, REST, SCUBA, SPA, SPA1, SPA2, SPA3, SPAMGR, TEMMY, TIK, TOMOKA, WELCMGR
```

### `cte_taux_tva` (2 valeurs)

```
0, 7
```

### `cte_service` (16 valeurs)

```
, BABY, BARD, BOUT, CMAF, COMM, ESTH, EXCU, GEST, INFI, PLAN, PRES, REST, SPNA, SPTE, TRAF
```

### `cte_id_acceptation` (2 valeurs)

```
, PHUC-347243491-20251204041531
```

### `cte_free_extra` (2 valeurs)

```
0, 1
```

### `cte_num_terminal_vente` (28 valeurs)

```
0, 1, 21, 22, 23, 4, 430, 431, 432, 433, 5, 500, 520, 550, 551, 6, 775, 80, 801, 810, 90, 920, 940, 941, 942, 960, 980, 990
```

### `cte_activite_comptable` (6 valeurs)

```
0, 205, 276, 325, 340, 385
```

### `cte_type_art` (4 valeurs)

```
, TRF, VRL, VSL
```

### `cte_stype_art` (2 valeurs)

```
, LCO
```

### `cte_login_vendeur` (14 valeurs)

```
, 453170, Arkon BU, Assistan, beam, Beam, DoreenY, FAM, GIFT, Jaa, MICKY, mild, Mind, Welcome
```

### `cte_matricule` (2 valeurs)

```
, 453170
```

### `cte_type_credit` (2 valeurs)

```
, GP
```

### `cte_commentaire_annulation` (42 valeurs)

```
, ., because 22 room changed to 18 room, because of sick , cancel, Change payment method , CXL, CXL 2 hours, cxl test, DOUBLE CHARGE, DOUBLE CHARGED, Double post, FREE FROM ANOUCK, GIVE FOR FREE BY DYLAN, NEED LCO TILL 16H00, need to be 3hrs
, NEED TO BE AMAX (TBA), NEED TO BE REDDOT, ok Dylan, ok DYLAN, Refund, test, ticket not print , wrong , WRONG, wrong amount , Wrong charge, WRONG DESCRIBTION, WRONG INFORMATION, wrong need to be VISA, wrong operation, Wrong operation, Wrong Operation , Wrong operation/ GM need only 3 hrs. , WRONG PAYMENT, WRONG PAYMENT MEDTHOD, wrong post, WRONG POST, wrong posting, wrong proceed, WRONG SIDE, Y
```

### `cte_num_ligne` (15 valeurs)

```
0, 10, 100, 110, 120, 130, 140, 20, 30, 40, 50, 60, 70, 80, 90
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil018_dat_IDX_2 | NONCLUSTERED | non | cte_societe, cte_compte_gm, cte_filiation, cte_date_d_operation, cte_heure_operation |
| cafil018_dat_IDX_7 | NONCLUSTERED | non | cte_num_ticket |
| cafil018_dat_IDX_4 | NONCLUSTERED | non | cte_societe, cte_date_comptable, cte_code_type |
| cafil018_dat_IDX_1 | NONCLUSTERED | non | cte_societe, cte_compte_gm, cte_date_d_operation, cte_heure_operation |
| cafil018_dat_IDX_6 | NONCLUSTERED | oui | RowId_40 |
| cafil018_dat_IDX_5 | NONCLUSTERED | non | cte_societe, cte_date_comptable, cte_operateur, cte_code_type |
| cafil018_dat_IDX_3 | NONCLUSTERED | non | cte_societe, cte_compte_gm, cte_code_type, cte_date_d_operation, cte_heure_operation |

