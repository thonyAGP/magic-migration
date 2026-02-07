# pv_presta_dat

| Info | Valeur |
|------|--------|
| Lignes | 29 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pre_code_circuit` | nvarchar | 6 | non |  | 29 |
| 2 | `description` | nvarchar | 20 | non |  | 29 |
| 3 | `cat` | int | 10 | non |  | 5 |
| 4 | `sub_cat` | int | 10 | non |  | 7 |
| 5 | `sub_sub_cat` | int | 10 | non |  | 15 |
| 6 | `pv_service` | nvarchar | 4 | non |  | 5 |

## Valeurs distinctes

### `pre_code_circuit` (29 valeurs)

```
, AAPHU1, PHU3PL, PHU9PL, PHUBIG, PHUBP5, PHUBTN, PHUCAM, PHUCAN, PHUCOO, PHUELE, PHUPCA, PHUPCB, PHUPCD, PHUS01, PHUS02, PHUS03, PHUS04, PHUS05, PHUS06, PHUS07, PHUS08, PHUS16, PHUS17, PHUS18, PHUS19, PHUS20, PHUS21, PHUS22
```

### `description` (29 valeurs)

```
, 2H package After 4pm, 2H package Befor 4pm, 2H package Morning, 4H package After 4pm, 4H package Befor 4pm, 4H package Morning, 50 Facial After 4pm, 50 Facial Before 4pm, 50 Facial Morning, 50 Massage After 4pm, 50 Massage Befor 4pm, 50 Massage Morning, 6H package After 4pm, 6H package Befor 4pm, 6H package Morning, BABY CLUB 4-23MONTHS, Back to the Nature, BIG BUDDHA TEMPLE, CANOE, Corail and Maiton, ELEPHANT STROLLING, PL.CONF.ACC.PAOW, PL.CONF.ACCOMP(4PL), PL.CONF.ACCOMP(5PL), PL.DEBUTANT.3PL, PL.DEBUTANT.5PL, PL.DEBUTANT.9PL, ROYAL THAI COOKING C
```

### `cat` (5 valeurs)

```
1, 2, 3, 5, 8
```

### `sub_cat` (7 valeurs)

```
1, 10, 13, 2, 3, 5, 7
```

### `sub_sub_cat` (15 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 3, 4, 5, 6, 7, 8, 9
```

### `pv_service` (5 valeurs)

```
BABY, BARD, ESTH, EXCU, SPNA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_presta_dat_IDX_1 | NONCLUSTERED | oui | pv_service, pre_code_circuit |

