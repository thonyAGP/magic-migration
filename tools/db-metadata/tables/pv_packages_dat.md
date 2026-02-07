# pv_packages_dat

| Info | Valeur |
|------|--------|
| Lignes | 6705 |
| Colonnes | 47 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pos_id` | float | 53 | non |  | 1636 |
| 2 | `package_id_out` | float | 53 | non |  | 6623 |
| 3 | `package_id_in` | float | 53 | non |  | 420 |
| 4 | `date__start_` | char | 8 | non |  | 505 |
| 5 | `date__end_` | char | 8 | non |  | 506 |
| 6 | `cat` | int | 10 | non |  | 20 |
| 7 | `sub_cat` | int | 10 | non |  | 17 |
| 8 | `sub_sub_cat` | int | 10 | non |  | 33 |
| 9 | `description` | nvarchar | 50 | non |  | 388 |
| 10 | `action_type` | nvarchar | 10 | non |  | 2 |
| 11 | `#_days` | float | 53 | non |  | 1 |
| 12 | `price` | float | 53 | non |  | 558 |
| 13 | `discount` | float | 53 | non |  | 15 |
| 14 | `discount_reason` | int | 10 | non |  | 11 |
| 15 | `payer_xcust_id` | float | 53 | non |  | 1151 |
| 16 | `payment_type` | nvarchar | 15 | non |  | 7 |
| 17 | `pms_transaction__` | bit |  | non |  | 2 |
| 18 | `validated__` | bit |  | non |  | 2 |
| 19 | `comment` | nvarchar | 100 | non |  | 902 |
| 20 | `bank_accounting_date` | char | 8 | non |  | 513 |
| 21 | `date_create` | char | 8 | non |  | 509 |
| 22 | `time_create` | char | 6 | non |  | 5655 |
| 23 | `user_create` | nvarchar | 10 | non |  | 20 |
| 24 | `date_update` | char | 8 | non |  | 513 |
| 25 | `time_update` | char | 6 | non |  | 4239 |
| 26 | `user_update` | nvarchar | 10 | non |  | 20 |
| 27 | `pv_service` | nvarchar | 4 | non |  | 9 |
| 28 | `cpk_quantity` | float | 53 | non |  | 30 |
| 29 | `cpk_unit_price` | float | 53 | non |  | 391 |
| 30 | `cpk_vat` | float | 53 | non |  | 2 |
| 31 | `cpk_article` | nvarchar | 8 | non |  | 29 |
| 32 | `lieu_vente` | nvarchar | 6 | non |  | 11 |
| 33 | `cpk_montant_prepaid` | float | 53 | non |  | 117 |
| 34 | `vendeur` | nvarchar | 8 | non |  | 83 |
| 35 | `saisie_manuelle_prepaid` | bit |  | non |  | 2 |
| 36 | `free_extra` | bit |  | non |  | 2 |
| 37 | `montant_total_pour_free_extra` | float | 53 | non |  | 102 |
| 38 | `montant_free_extra` | float | 53 | non |  | 117 |
| 39 | `payment_type_original` | nvarchar | 15 | non |  | 3 |
| 40 | `discount_original` | float | 53 | non |  | 4 |
| 41 | `package_id_out_free_extra` | float | 53 | non |  | 1067 |
| 42 | `ordre_edition` | float | 53 | non |  | 45 |
| 43 | `vente_en_mobilite` | bit |  | non |  | 2 |
| 44 | `presence_cm_pass` | bit |  | non |  | 2 |
| 45 | `cashier` | nvarchar | 8 | non |  | 61 |
| 46 | `prix_net` | float | 53 | non |  | 589 |
| 47 | `prepaid_m_e` | bit |  | non |  | 2 |

## Valeurs distinctes

### `cat` (20 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 20, 3, 33, 4, 5, 6, 7, 8, 9
```

### `sub_cat` (17 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sub_sub_cat` (33 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 4, 5, 6, 7, 8, 9
```

### `action_type` (2 valeurs)

```
CANCEL, SALE
```

### `#_days` (1 valeurs)

```
0
```

### `discount` (15 valeurs)

```
0, 0.93, 1.35, 10, 100, 15, 20, 30, 40, 40.92, 5, 50, 53.57, 60, 9.09
```

### `discount_reason` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 99
```

### `payment_type` (7 valeurs)

```
, CLUBMED PASS, CREDIT CARD, FREE, GIFT PASS, PREPAID, REFUSAL TO SELL
```

### `pms_transaction__` (2 valeurs)

```
0, 1
```

### `validated__` (2 valeurs)

```
0, 1
```

### `user_create` (20 valeurs)

```
ASSTFAM, BAR1, BAR3, BARMGR, BTQ, BTQMGR, EXC, EXCMGR, FAM, FAMILLE, NURSE, PLANNING, PRAKBAR, REST, SCUBA, SPA, SPA1, SPA2, SPA3, SPAMGR
```

### `user_update` (20 valeurs)

```
, ASSTFAM, BAR1, BAR3, BARMGR, BTQ, BTQMGR, EXC, EXCMGR, FAM, FAMILLE, NURSE, PRAKBAR, REST, SCUBA, SPA, SPA1, SPA2, SPA3, SPAMGR
```

### `pv_service` (9 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, REST, SPNA
```

### `cpk_quantity` (30 valeurs)

```
1, -1, 10, 11, 12, 15, -15, 17, 19, 2, -2, 20, 28, 29, 3, -3, 30, 33, 4, -4, 5, -5, 50, 6, -6, 7, -7, 8, -8, 9
```

### `cpk_vat` (2 valeurs)

```
0, 7
```

### `cpk_article` (29 valeurs)

```
, 000029, 0021, 005, 22G00085, 22J00015, 22J00016, 400, AAPHU1, CMP, COCO  GR, GO MASS, GO PACK, PDTVIS, PHUBP5, PHUPCD, PHUS01, PHUS02, PHUS04, PHUS05, PHUS06, PHUS07, PHUS08, PHUS16, PHUS17, PHUS18, PHUS19, PHUS20, PHUS22
```

### `lieu_vente` (11 valeurs)

```
, BARD, BARFRO, EXC, FRONT, NURSE, PETITC, RECEP, SCUBA, SHOP, SPA
```

### `saisie_manuelle_prepaid` (2 valeurs)

```
0, 1
```

### `free_extra` (2 valeurs)

```
0, 1
```

### `payment_type_original` (3 valeurs)

```
, CLUBMED PASS, CREDIT CARD
```

### `discount_original` (4 valeurs)

```
0, 10, 15, 20
```

### `ordre_edition` (45 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 5, 6, 7, 8, 9
```

### `vente_en_mobilite` (2 valeurs)

```
0, 1
```

### `presence_cm_pass` (2 valeurs)

```
0, 1
```

### `prepaid_m_e` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_packages_dat_IDX_5 | NONCLUSTERED | non | pv_service, payer_xcust_id, validated__ |
| pv_packages_dat_IDX_1 | NONCLUSTERED | oui | pv_service, pos_id, package_id_out |
| pv_packages_dat_IDX_3 | NONCLUSTERED | non | pv_service, pos_id, cat, sub_cat, sub_sub_cat |
| pv_packages_dat_IDX_2 | NONCLUSTERED | non | pv_service, bank_accounting_date, pms_transaction__, payment_type, package_id_out |
| pv_packages_dat_IDX_4 | NONCLUSTERED | non | pv_service, package_id_out |

