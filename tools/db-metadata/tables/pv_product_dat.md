# pv_product_dat

| Info | Valeur |
|------|--------|
| Lignes | 1137 |
| Colonnes | 33 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cat` | int | 10 | non |  | 20 |
| 2 | `sub_cat` | int | 10 | non |  | 18 |
| 3 | `prod_id` | int | 10 | non |  | 36 |
| 4 | `ordre` | int | 10 | non |  | 1 |
| 5 | `label` | nvarchar | 20 | non |  | 735 |
| 6 | `number_days` | float | 53 | non |  | 16 |
| 7 | `prix_de_vente` | float | 53 | non |  | 332 |
| 8 | `block_free__` | bit |  | non |  | 2 |
| 9 | `block_discount__` | bit |  | non |  | 2 |
| 10 | `tampon` | nvarchar | 7 | non |  | 1 |
| 11 | `pv_service` | nvarchar | 4 | non |  | 16 |
| 12 | `art_code_article` | nvarchar | 8 | non |  | 9 |
| 13 | `art_prix_achat` | float | 53 | non |  | 153 |
| 14 | `art_non_gere_en_stock` | bit |  | non |  | 2 |
| 15 | `art_quantite_en_stock` | float | 53 | non |  | 84 |
| 16 | `art_unite_vente` | nvarchar | 3 | non |  | 4 |
| 17 | `art_tva` | float | 53 | non |  | 2 |
| 18 | `art_volume_vendu` | float | 53 | non |  | 14 |
| 19 | `art_decimales` | int | 10 | non |  | 1 |
| 20 | `art_volume_achat` | float | 53 | non |  | 11 |
| 21 | `art_prix_achat_bottle` | float | 53 | non |  | 119 |
| 22 | `art_logique_1` | bit |  | non |  | 1 |
| 23 | `art_logique_2` | bit |  | non |  | 1 |
| 24 | `art_actif` | nvarchar | 1 | non |  | 2 |
| 25 | `art_free_extra` | bit |  | non |  | 2 |
| 26 | `art_sales_place_independant` | bit |  | non |  | 2 |
| 27 | `art_sale_label` | nvarchar | 20 | non |  | 291 |
| 28 | `id_booker` | int | 10 | non |  | 41 |
| 29 | `elligible_credit_go` | bit |  | non |  | 2 |
| 30 | `art_copy_cat_scat` | bit |  | non |  | 2 |
| 31 | `art_nature` | nvarchar | 1 | non |  | 2 |
| 32 | `art_force_ticket` | bit |  | non |  | 1 |
| 33 | `price_meetings_event` | float | 53 | non |  | 25 |

## Valeurs distinctes

### `cat` (20 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 3, 4, 5, 6, 7, 8, 9
```

### `sub_cat` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `prod_id` (36 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 4, 5, 6, 7, 8, 9
```

### `ordre` (1 valeurs)

```
0
```

### `number_days` (16 valeurs)

```
0, 0.5, 1, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `block_free__` (2 valeurs)

```
0, 1
```

### `block_discount__` (2 valeurs)

```
0, 1
```

### `pv_service` (16 valeurs)

```
BABY, BARD, BOUT, CAIS, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, REST, SKIN, SPNA, SPTE, STAN
```

### `art_code_article` (9 valeurs)

```
, 000029, 0021, 005, 009, 400, CMP, COCO  GR, PR COCKT
```

### `art_non_gere_en_stock` (2 valeurs)

```
0, 1
```

### `art_unite_vente` (4 valeurs)

```
, BTL, CL, PC
```

### `art_tva` (2 valeurs)

```
0, 7
```

### `art_volume_vendu` (14 valeurs)

```
0, 1, 100, 12.5, 15, 150, 20, 33, 35, 4, 50, 6, 70, 75
```

### `art_decimales` (1 valeurs)

```
0
```

### `art_volume_achat` (11 valeurs)

```
0, 1, 100, 120, 150, 20, 33, 35, 50, 70, 75
```

### `art_logique_1` (1 valeurs)

```
0
```

### `art_logique_2` (1 valeurs)

```
0
```

### `art_actif` (2 valeurs)

```
N, O
```

### `art_free_extra` (2 valeurs)

```
0, 1
```

### `art_sales_place_independant` (2 valeurs)

```
0, 1
```

### `id_booker` (41 valeurs)

```
0, 4721862, 4721863, 4721864, 4721865, 4721866, 4721867, 4721868, 4721869, 4721870, 4721871, 4721872, 4721876, 4721879, 4721881, 4721882, 4721883, 4721884, 4721885, 4721886, 4721887, 4721888, 4721889, 4721890, 4721891, 4721892, 4721893, 4721894, 4721895, 4721896, 4721897, 4721898, 4721899, 4722220, 4722221, 4722222, 4722247, 4722262, 4722266, 4722272, 4723837
```

### `elligible_credit_go` (2 valeurs)

```
0, 1
```

### `art_copy_cat_scat` (2 valeurs)

```
0, 1
```

### `art_nature` (2 valeurs)

```
, S
```

### `art_force_ticket` (1 valeurs)

```
0
```

### `price_meetings_event` (25 valeurs)

```
0, 1000, 1300, 1800, 1890, 2000, 250, 2500, 2600, 2700, 2800, 350, 3600, 375, 3800, 400, 4050, 4200, 450, 5000, 550, 5600, 5670, 800, 900
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_product_dat_IDX_1 | NONCLUSTERED | oui | pv_service, cat, sub_cat, prod_id |

