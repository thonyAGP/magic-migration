# excupop_dat

| Info | Valeur |
|------|--------|
| Lignes | 22 |
| Colonnes | 35 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `exc_type` | nvarchar | 1 | non |  | 1 |
| 2 | `exc_code` | int | 10 | non |  | 22 |
| 3 | `exc_libelle` | nvarchar | 20 | non |  | 22 |
| 4 | `exc_numero_article` | int | 10 | non |  | 22 |
| 5 | `exc_reservation` | nvarchar | 1 | non |  | 1 |
| 6 | `exc_location` | nvarchar | 1 | non |  | 1 |
| 7 | `exc_prestation` | nvarchar | 6 | non |  | 1 |
| 8 | `exc_places_1________` | int | 10 | non |  | 1 |
| 9 | `exc_places_2________` | int | 10 | non |  | 1 |
| 10 | `exc_places_3________` | int | 10 | non |  | 1 |
| 11 | `exc_places_4________` | int | 10 | non |  | 1 |
| 12 | `exc_places_5________` | int | 10 | non |  | 1 |
| 13 | `exc_places_6________` | int | 10 | non |  | 1 |
| 14 | `exc_places_7________` | int | 10 | non |  | 1 |
| 15 | `exc_places_8________` | int | 10 | non |  | 1 |
| 16 | `exc_horaire_reveil` | char | 6 | non |  | 5 |
| 17 | `exc_horaire_ptidej` | char | 6 | non |  | 4 |
| 18 | `exc_horaire_depart` | char | 6 | non |  | 8 |
| 19 | `exc_horaire_retour` | char | 6 | non |  | 8 |
| 20 | `exc_duree` | int | 10 | non |  | 2 |
| 21 | `exc_lieu_depart` | nvarchar | 20 | non |  | 3 |
| 22 | `exc_mini_club_de` | int | 10 | non |  | 2 |
| 23 | `exc_mini_club_a` | int | 10 | non |  | 3 |
| 24 | `exc_mini_club_pech` | nvarchar | 20 | non |  | 1 |
| 25 | `exc_go_accompagne` | nvarchar | 1 | non |  | 2 |
| 26 | `exc_guide` | nvarchar | 1 | non |  | 2 |
| 27 | `exc_lundi` | nvarchar | 1 | non |  | 1 |
| 28 | `exc_mardi` | nvarchar | 1 | non |  | 1 |
| 29 | `exc_mercredi` | nvarchar | 1 | non |  | 1 |
| 30 | `exc_jeudi` | nvarchar | 1 | non |  | 2 |
| 31 | `exc_vendredi` | nvarchar | 1 | non |  | 1 |
| 32 | `exc_samedi` | nvarchar | 1 | non |  | 1 |
| 33 | `exc_dimanche` | nvarchar | 1 | non |  | 1 |
| 34 | `exc_quantite_saison` | int | 10 | non |  | 22 |
| 35 | `exc_montant_saison` | float | 53 | non |  | 22 |

## Valeurs distinctes

### `exc_type` (1 valeurs)

```
1
```

### `exc_code` (22 valeurs)

```
1, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 26, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37
```

### `exc_libelle` (22 valeurs)

```
A LA CARTE, BANGKOK, CANOE AD, CANOE CHD, CANYON COURSE, DSF, ELEPHANT AD, ELEPHANT CHLD, FANTASEA, JUNK AD, JUNK CHLD, LAKE COURSE, LOCH PALM, PHI PHI AD, PHI PHI CHLD, PKT COUNTRY, PRIVATE BOAT, RED MOUNTAIN, SIMON CABARET, SIMON CH, TEMPLE AD, TEMPLE CHD
```

### `exc_numero_article` (22 valeurs)

```
10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 31, 35, 36, 37
```

### `exc_places_1________` (1 valeurs)

```
0
```

### `exc_places_2________` (1 valeurs)

```
0
```

### `exc_places_3________` (1 valeurs)

```
0
```

### `exc_places_4________` (1 valeurs)

```
0
```

### `exc_places_5________` (1 valeurs)

```
0
```

### `exc_places_6________` (1 valeurs)

```
0
```

### `exc_places_7________` (1 valeurs)

```
0
```

### `exc_places_8________` (1 valeurs)

```
0
```

### `exc_horaire_reveil` (5 valeurs)

```
000000, 060000, 063000, 070000, 080000
```

### `exc_horaire_ptidej` (4 valeurs)

```
000000, 070000, 073000, 083000
```

### `exc_horaire_depart` (8 valeurs)

```
060000, 063000, 070000, 073000, 080000, 090000, 194500, 210000
```

### `exc_horaire_retour` (8 valeurs)

```
111500, 120000, 163000, 170000, 173000, 180000, 231500, 234500
```

### `exc_duree` (2 valeurs)

```
0, 1
```

### `exc_lieu_depart` (3 valeurs)

```
, reception, Reception
```

### `exc_mini_club_de` (2 valeurs)

```
0, 4
```

### `exc_mini_club_a` (3 valeurs)

```
0, 11, 12
```

### `exc_go_accompagne` (2 valeurs)

```
N, O
```

### `exc_guide` (2 valeurs)

```
N, O
```

### `exc_lundi` (1 valeurs)

```
O
```

### `exc_mardi` (1 valeurs)

```
O
```

### `exc_mercredi` (1 valeurs)

```
O
```

### `exc_jeudi` (2 valeurs)

```
N, O
```

### `exc_vendredi` (1 valeurs)

```
O
```

### `exc_samedi` (1 valeurs)

```
O
```

### `exc_dimanche` (1 valeurs)

```
O
```

### `exc_quantite_saison` (22 valeurs)

```
10, 115, 135, 14272, 1774, 191, 19718, 216, 244, 294, 3253, 35, 381, 383, 4776, 531, 5912, 593, 61, 6932, 76, 906
```

### `exc_montant_saison` (22 valeurs)

```
1.13139e+006, 1.20535e+006, 1.35193e+007, 1.43651e+007, 2.18139e+007, 2.25564e+006, 2.30395e+006, 2.36896e+006, 2.37185e+006, 2.48357e+006, 21600, 3.34319e+007, 4.66756e+006, 5.04188e+007, 5.55383e+006, 52920, 585480, 629440, 644000, 767391, 88320, 947430
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excupop_dat_IDX_1 | NONCLUSTERED | oui | exc_type, exc_code |
| excupop_dat_IDX_3 | NONCLUSTERED | non | exc_type, exc_reservation, exc_libelle |
| excupop_dat_IDX_2 | NONCLUSTERED | non | exc_type, exc_libelle |

