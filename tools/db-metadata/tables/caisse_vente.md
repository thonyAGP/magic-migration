# caisse_vente

| Info | Valeur |
|------|--------|
| Lignes | 2931 |
| Colonnes | 48 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ven_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ven_compte_gm` | int | 10 | non |  | 830 |
| 3 | `ven_filiation` | int | 10 | non |  | 11 |
| 4 | `ven_imputation` | float | 53 | non |  | 20 |
| 5 | `ven_sous_imputation` | int | 10 | non |  | 19 |
| 6 | `ven_libelle` | nvarchar | 20 | oui |  | 625 |
| 7 | `ven_libelle_supplem_` | nvarchar | 20 | oui |  | 557 |
| 8 | `ven_credit_debit` | nvarchar | 1 | non |  | 2 |
| 9 | `ven_flag_annulation` | nvarchar | 1 | non |  | 2 |
| 10 | `ven_code_type` | nvarchar | 1 | non |  | 1 |
| 11 | `ven_numero_chrono` | int | 10 | non |  | 49 |
| 12 | `ven_avec_change` | nvarchar | 1 | non |  | 2 |
| 13 | `ven_mode_de_paiement` | nvarchar | 4 | non |  | 8 |
| 14 | `ven_montant` | float | 53 | non |  | 582 |
| 15 | `ven_date_comptable` | char | 8 | non |  | 187 |
| 16 | `ven_date_d_operation` | char | 8 | non |  | 187 |
| 17 | `ven_heure_operation` | char | 6 | non |  | 1966 |
| 18 | `ven_nbre_d_articles` | int | 10 | non |  | 14 |
| 19 | `ven_flag_application` | nvarchar | 1 | non |  | 4 |
| 20 | `ven_type_transaction` | nvarchar | 1 | non |  | 3 |
| 21 | `ven_operateur` | nvarchar | 8 | non |  | 19 |
| 22 | `RowId_263` | int | 10 | non |  | 2931 |
| 23 | `ven_ref_article` | float | 53 | non |  | 910 |
| 24 | `ven_taux_tva` | float | 53 | non |  | 2 |
| 25 | `ven_no_facture` | float | 53 | non |  | 12 |
| 26 | `ven_service` | nvarchar | 4 | non |  | 12 |
| 27 | `ven_montant_remise` | float | 53 | non |  | 122 |
| 28 | `ven_id_transaction` | nvarchar | 32 | oui |  | 1 |
| 29 | `ven_id_acceptation` | nvarchar | 32 | oui |  | 1 |
| 30 | `ven_free_extra` | bit |  | non |  | 2 |
| 31 | `ven_montant_total_pour_free_ext` | float | 53 | non |  | 24 |
| 32 | `ven_montant_free_extra` | float | 53 | non |  | 68 |
| 33 | `ven_num_terminal_vente` | int | 10 | non |  | 12 |
| 34 | `ven_activite_comptable` | int | 10 | non |  | 3 |
| 35 | `ven_id_ligne_annulation` | int | 10 | non |  | 126 |
| 36 | `ven_num_cheque` | nvarchar | 30 | non |  | 1 |
| 37 | `ven_type_art` | nvarchar | 6 | non |  | 4 |
| 38 | `ven_stype_art` | nvarchar | 6 | non |  | 2 |
| 39 | `ven_login_vendeur` | nvarchar | 8 | non |  | 10 |
| 40 | `ven_matricule` | nvarchar | 30 | non |  | 2 |
| 41 | `ven_type_credit` | nvarchar | 2 | non |  | 2 |
| 42 | `ven_commentaire_annulation` | nvarchar | 100 | non |  | 26 |
| 43 | `ven_num_tpe` | nvarchar | 20 | non |  | 1 |
| 44 | `ven_num_ticket` | nvarchar | 50 | non |  | 823 |
| 45 | `ven_num_ligne` | int | 10 | non |  | 13 |
| 46 | `ven_token_id` | nvarchar | 32 | non |  | 1 |
| 47 | `ven_transaction_id` | nvarchar | 32 | non |  | 1 |
| 48 | `ven_no_galaxy_order` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `ven_societe` (1 valeurs)

```
C
```

### `ven_filiation` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `ven_imputation` (20 valeurs)

```
4.6765e+008, 5.801e+008, 7.0625e+008, 7.0641e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008, 7.0887e+008
```

### `ven_sous_imputation` (19 valeurs)

```
0, 101, 102, 103, 105, 109, 11, 112, 114, 121, 122, 126, 128, 131, 132, 17, 18, 38, 7
```

### `ven_credit_debit` (2 valeurs)

```
C, D
```

### `ven_flag_annulation` (2 valeurs)

```
A, N
```

### `ven_code_type` (1 valeurs)

```
O
```

### `ven_numero_chrono` (49 valeurs)

```
0, 1, 10001, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 12, 1209, 14, 1700, 1701, 1755, 1756, 1757, 1759, 1760, 1761, 1767, 1768, 1769, 1771, 1772, 1773, 1774, 1781, 1783, 1789, 1792, 1793, 1794, 1799, 1801, 1802, 1803, 1806, 1807, 2102, 2107, 22, 2700, 2900, 550, 551, 800, 942
```

### `ven_avec_change` (2 valeurs)

```
, N
```

### `ven_mode_de_paiement` (8 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, UNIO, VISA, WECH
```

### `ven_nbre_d_articles` (14 valeurs)

```
1, -1, 10, 11, 16, 2, 3, 4, 5, 6, 60, 7, 8, 9
```

### `ven_flag_application` (4 valeurs)

```
A, P, R, W
```

### `ven_type_transaction` (3 valeurs)

```
, C, M
```

### `ven_operateur` (19 valeurs)

```
ARKON   , ASSTFAM, BARMGR, BEAM    , DOREEN  , EXC, EXCMGR, FAM, GIFT, JAA     , JULIA   , MIND, OpenBrav, OPENBRAV, PLANNING, REST, SPA1, SPA2, SPAMGR
```

### `ven_taux_tva` (2 valeurs)

```
0, 7
```

### `ven_no_facture` (12 valeurs)

```
0, 2.59904e+007, 2.59905e+007
```

### `ven_service` (12 valeurs)

```
BARD, BOUT, CMAF, ESTH, EXCU, GEST, MINI, PLAN, PRES, REST, SPTE, TRAF
```

### `ven_free_extra` (2 valeurs)

```
0, 1
```

### `ven_montant_total_pour_free_ext` (24 valeurs)

```
0, 12600, 1400, 1500, 15000, 16500, 18000, 18900, 2000, 2088, 22800, 2300, 25200, 3000, 3550, 4200, 45000, 4600, 4800, 5000, 5400, 6000, 6300, 6500
```

### `ven_num_terminal_vente` (12 valeurs)

```
0, 1, 22, 430, 431, 432, 433, 500, 550, 551, 801, 942
```

### `ven_activite_comptable` (3 valeurs)

```
0, 205, 340
```

### `ven_type_art` (4 valeurs)

```
, TRF, VRL, VSL
```

### `ven_stype_art` (2 valeurs)

```
, LCO
```

### `ven_login_vendeur` (10 valeurs)

```
, Arkon BU, Assistan, Beam, DoreenY, FAM, GIFT, Jaa, mild, Vieilles
```

### `ven_matricule` (2 valeurs)

```
, 453170
```

### `ven_type_credit` (2 valeurs)

```
, GP
```

### `ven_commentaire_annulation` (26 valeurs)

```
, CANCEL, CANCEL
, change to full day pass, CHARGED WRONG NAME, CXL DUE TO ROOM ISSUE [ WIFI/PHONE ], CXL LCO COZ OF MISCOMMUNICATED, DOUBLE CHARGE, GM paid by  cash + by Visa, GM silver member, Need to be Cash Outside, Need to charged on GM name E1144, NEED TO PUT -50%, OK Dylan, test, wrong, WRONG AMOUNTS, wrong month, wrong operation , Wrong operation, WRONG OPERATION, Wrong operatoin, WRONG PERSON, wrong post, WRONG POST, WRONG TYPE OF STAY
```

### `ven_num_ligne` (13 valeurs)

```
0, 10, 100, 110, 120, 20, 30, 40, 50, 60, 70, 80, 90
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_vente_IDX_5 | NONCLUSTERED | non | ven_societe, ven_date_comptable, ven_operateur, ven_code_type |
| caisse_vente_IDX_2 | NONCLUSTERED | non | ven_societe, ven_compte_gm, ven_filiation, ven_date_d_operation, ven_heure_operation |
| caisse_vente_IDX_7 | NONCLUSTERED | non | ven_num_ticket |
| caisse_vente_IDX_4 | NONCLUSTERED | non | ven_societe, ven_date_comptable, ven_code_type |
| caisse_vente_IDX_1 | NONCLUSTERED | non | ven_societe, ven_compte_gm, ven_date_d_operation, ven_heure_operation |
| caisse_vente_IDX_6 | NONCLUSTERED | oui | RowId_263 |
| caisse_vente_IDX_3 | NONCLUSTERED | non | ven_societe, ven_compte_gm, ven_code_type, ven_date_d_operation, ven_heure_operation |

