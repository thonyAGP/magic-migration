# kid_club_register

| Info | Valeur |
|------|--------|
| Lignes | 22507 |
| Colonnes | 10 |
| Clef primaire | kcr_id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `kcr_id` | bigint | 19 | non | PK | 22507 |
| 2 | `kcr_kid_stay_id` | bigint | 19 | non |  | 2966 |
| 3 | `kcr_dt_creation` | datetime |  | non |  | 22507 |
| 4 | `kcr_user` | nvarchar | 8 | non |  | 33 |
| 5 | `kcr_operation` | char | 1 | non |  | 4 |
| 6 | `kcr_performer_stay_id` | bigint | 19 | non |  | 2892 |
| 7 | `kcr_label` | nvarchar | 50 | oui |  | 7 |
| 8 | `kcr_comment` | nvarchar | 3000 | oui |  | 351 |
| 9 | `kcr_is_cmp` | bit |  | non |  | 2 |
| 10 | `kcr_pdf` | varbinary | MAX | oui |  | 18155 |

## Valeurs distinctes

### `kcr_user` (33 valeurs)

```
AAUM, ADD, ARRI, AYOUB, BEW, CARA, CHERRY, CRYSTAL, FAMILLE, FILM, GUS, IRIS, JADEN, JESSICA, JFROST, JILLY, JINA, MAI, MANOW, MILK, NAM, NINA, PALM, PATRICK, PAULINE, PLOY, RITA, SERGIO, SHEBA, SOPHIA, VICKY, YINI, ZIX
```

### `kcr_operation` (4 valeurs)

```
C, E, R, V
```

### `kcr_label` (7 valeurs)

```
KIDS_ALLERGY, KIDS_COMMENT, KIDS_DAILY_TRACKING, KIDS_DROP, KIDS_PDF, KIDS_RELEASE, KIDS_UPDATE
```

### `kcr_is_cmp` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| kid_club_register_IDX_1 | NONCLUSTERED | oui | kcr_kid_stay_id, kcr_operation, kcr_dt_creation |

