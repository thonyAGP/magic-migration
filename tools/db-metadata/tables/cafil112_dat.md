# cafil112_dat

| Info | Valeur |
|------|--------|
| Lignes | 2206 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vol_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `vol_aller_retour` | nvarchar | 1 | non |  | 2 |
| 3 | `vol_date` | char | 8 | non |  | 263 |
| 4 | `vol_heure` | int | 10 | non |  | 21 |
| 5 | `vol_selection` | nvarchar | 1 | non |  | 3 |
| 6 | `vol_code_vol` | nvarchar | 6 | non |  | 153 |
| 7 | `vol_ville` | nvarchar | 6 | non |  | 29 |
| 8 | `vol_transport` | nvarchar | 2 | non |  | 8 |
| 9 | `vol_heure_village` | int | 10 | non |  | 19 |
| 10 | `heure_liberation` | varchar | 6 | non |  | 1 |

## Valeurs distinctes

### `vol_societe` (1 valeurs)

```
C
```

### `vol_aller_retour` (2 valeurs)

```
A, R
```

### `vol_heure` (21 valeurs)

```
0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 3, 5, 6, 7, 8, 9
```

### `vol_selection` (3 valeurs)

```
A, M, Z
```

### `vol_ville` (29 valeurs)

```
, 1FR, AUH, BKK, BRU, CAN, CNX, DEL, DOH, DPS, DXB, G2E, HEL, HGH, HKG, ICN, IST, KUL, MEL, PEK, PEN, PER, PVG, SIN, SYD, TFU, TL3, TPE, ZRH
```

### `vol_transport` (8 valeurs)

```
, CF, CM, DR, ND, RF, TO, WT
```

### `vol_heure_village` (19 valeurs)

```
0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 3, -4, 8, 9
```

### `heure_liberation` (1 valeurs)

```
000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil112_dat_IDX_2 | NONCLUSTERED | non | vol_societe, vol_aller_retour, vol_code_vol, vol_date |
| cafil112_dat_IDX_3 | NONCLUSTERED | non | vol_societe, vol_date |
| cafil112_dat_IDX_1 | NONCLUSTERED | oui | vol_societe, vol_aller_retour, vol_date, vol_selection, vol_code_vol, vol_heure |

