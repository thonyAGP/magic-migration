# pv_shoe_size

**Nom logique Magic** : `pv_shoe_size`

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pss_id` | int | 10 | non |  | 8 |
| 2 | `pss_label` | nvarchar | 128 | non |  | 8 |
| 3 | `pss_service` | nvarchar | 4 | non |  | 1 |
| 4 | `pss_shoe_size_min` | int | 10 | non |  | 8 |
| 5 | `pss_shoe_size_max` | int | 10 | non |  | 8 |
| 6 | `pss_label_jpn` | nvarchar | 128 | non |  | 8 |

## Valeurs distinctes

### `pss_id` (8 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8
```

### `pss_label` (8 valeurs)

```
231-250 MM, 251-270 MM (â‰ƒ EU â‰¤ 35, US â‰¤ 4, UK â‰¤ 3), 271-290 MM (â‰ƒ EU 36.5-38.5, US 5-6.5, UK 4-5.5), 291-310 MM (â‰ƒ EU 39-41, US 7-8.5,UK 6-7.5), 311-330 MM (â‰ƒ EU 42-44, US 9-10.5, UK 8-9.5), 331-350 MM (â‰ƒ EU 44.5-46, US 11-12.5, UK 10-11.5), 351 MM AND MORE (â‰ƒ EU â‰¥ 47, US â‰¥ 13, UK â‰¥ 12), LESS THAN 230 MM
```

### `pss_service` (1 valeurs)

```
SKIN
```

### `pss_shoe_size_min` (8 valeurs)

```
0, 231, 251, 271, 291, 311, 331, 351
```

### `pss_shoe_size_max` (8 valeurs)

```
230, 250, 270, 290, 310, 330, 350, 999
```

### `pss_label_jpn` (8 valeurs)

```
â‰¤ 230 MM(â‰ˆ JPâ‰¤ 18.5, EUâ‰¤ 29), â‰¥ 351 MM (JP â‰¥ 31, EU â‰¥ 47, UK â‰¥ 12), 231-250 MM (â‰ˆ JP 19-20.5, EU 30-32), 251-270 MM (â‰ˆ JP 21-22.5, EU 33-36, UK 1-3.5), 271-290 MM (â‰ˆ JP 23-24.5, EU 36.5-38.5, UK 4-5.5), 291-310 MM (â‰ˆ JP 25-26.5, EU 39-41, UK 6-7.5), 311-330 MM (â‰ˆ JP 27-28.5, EU 42-44, UK 8-9.5), 331-350 MM (â‰ˆ JP 29-30.5, EU 44.5-47, UK 10-11.5)
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_shoe_size_IDX_1 | NONCLUSTERED | oui | pss_id |

