# kid_club_activity_registration

| Info | Valeur |
|------|--------|
| Lignes | 32953 |
| Colonnes | 9 |
| Clef primaire | kcg_id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `kcg_id` | bigint | 19 | non | PK | 32953 |
| 2 | `kcg_kid_stay_id` | bigint | 19 | non |  | 2079 |
| 3 | `kcg_dt_creation` | datetime |  | non |  | 32951 |
| 4 | `kcg_user` | nvarchar | 8 | non |  | 30 |
| 5 | `kcg_registration` | bit |  | non |  | 2 |
| 6 | `kcg_performer_stay_id` | bigint | 19 | non |  | 2079 |
| 7 | `kcg_activity_id` | bigint | 19 | non |  | 14 |
| 8 | `kcg_activity_date` | date |  | non |  | 215 |
| 9 | `kcg_day_period` | char | 1 | oui |  | 2 |

## Valeurs distinctes

### `kcg_user` (30 valeurs)

```
AAUM, ADD, ARRI, AYOUB, BEW, CARA, CHERRY, FAMILLE, FILM, GUS, IRIS, JADEN, JFROST, JILLY, JINA, MAI, MANOW, MILK, NAM, NINA, PALM, PATRICK, PAULINE, PLOY, RITA, SERGIO, SOPHIA, VICKY, YINI, ZIX
```

### `kcg_registration` (2 valeurs)

```
0, 1
```

### `kcg_activity_id` (14 valeurs)

```
10, 11, 12, 13, 14, 15, 16, 17, 18, 5, 6, 7, 8, 9
```

### `kcg_day_period` (2 valeurs)

```
A, P
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| kid_club_activity_registration_IDX_1 | NONCLUSTERED | oui | kcg_kid_stay_id, kcg_activity_id, kcg_registration, kcg_activity_date, kcg_day_period |

