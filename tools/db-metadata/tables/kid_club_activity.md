# kid_club_activity

| Info | Valeur |
|------|--------|
| Lignes | 14 |
| Colonnes | 8 |
| Clef primaire | kca_id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `kca_id` | bigint | 19 | non | PK | 14 |
| 2 | `kca_code` | char | 8 | non |  | 14 |
| 3 | `kca_label_fr` | nvarchar | 50 | non |  | 14 |
| 4 | `kca_label_en` | nvarchar | 50 | non |  | 14 |
| 5 | `kca_once_day` | bit |  | non |  | 2 |
| 6 | `kca_every_day` | bit |  | non |  | 2 |
| 7 | `kca_days` | char | 7 | oui |  | 1 |
| 8 | `kca_email` | nvarchar | 500 | oui |  | 1 |

## Valeurs distinctes

### `kca_id` (14 valeurs)

```
10, 11, 12, 13, 14, 15, 16, 17, 18, 5, 6, 7, 8, 9
```

### `kca_code` (14 valeurs)

```
AFAMILY , ARC     , BOXE    , CIRCUS  , CLIMB   , DINNER  , EFAMILY , INDACTI , LUNCH   , OASIS   , OUTACTI , POOL    , RELAX   , SNACK   
```

### `kca_label_fr` (14 valeurs)

```
Boxe ThaÃ¯ (en supplÃ©ment), Cirque, DÃ©jeuner, Diner, Escalade, EvÃ¨nement aprÃ¨s-midi, EvÃ¨nement du soir, GoÃ»ter, Jeux extÃ©rieurs (Foot,Tennis,Basket,Golf), Jeux intÃ©rieurs (Art & Craft), Oasis splash park, Piscine, Relaxation, Tir a lâ€™arc
```

### `kca_label_en` (14 valeurs)

```
Afternoon family event, Archery, Circus, Dinner, Evening family event, Indoor Activities (Art & Craft), Lunch, Oasis splash park, Outdoor Activities (Soccer,Tennis,Basketball,Golf), Relaxation time, Snack time, Swimming Pool, Thai Boxing lesson (additional), Wall Climbing
```

### `kca_once_day` (2 valeurs)

```
0, 1
```

### `kca_every_day` (2 valeurs)

```
0, 1
```

### `kca_days` (1 valeurs)

```
24     
```

### `kca_email` (1 valeurs)

```
phuckitc01@clubmed.com, phucfami01@clubmed.com, phuckitc03@clubmed.com, phuckitc02@clubmed.com, emmanuel.ernest.ext@clubmed.com
```

