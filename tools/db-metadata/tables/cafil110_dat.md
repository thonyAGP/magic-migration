# cafil110_dat

| Info | Valeur |
|------|--------|
| Lignes | 1312 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vot_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `vot_aller_div_retour` | nvarchar | 1 | non |  | 2 |
| 3 | `vot_date` | char | 8 | non |  | 130 |
| 4 | `vot_heure` | char | 6 | non |  | 160 |
| 5 | `vot_selection` | nvarchar | 1 | non |  | 1 |
| 6 | `vot_code_vol` | nvarchar | 6 | non |  | 151 |
| 7 | `vot_ville` | nvarchar | 6 | non |  | 29 |
| 8 | `vot_transport` | nvarchar | 2 | non |  | 8 |
| 9 | `vot_compagnie` | nvarchar | 9 | non |  | 31 |

## Valeurs distinctes

### `vot_societe` (1 valeurs)

```
C
```

### `vot_aller_div_retour` (2 valeurs)

```
A, R
```

### `vot_selection` (1 valeurs)

```
A
```

### `vot_ville` (29 valeurs)

```
, 1FR, AUH, BKK, BRU, CAN, CNX, DEL, DOH, DPS, DXB, G2E, HEL, HGH, HKG, ICN, IST, KUL, MEL, PEK, PEN, PER, PVG, SIN, SYD, TFU, TL3, TPE, ZRH
```

### `vot_transport` (8 valeurs)

```
CF, CM, DR, ND, RE, RF, TO, WT
```

### `vot_compagnie` (31 valeurs)

```
, AF, AI, AY, BR, CA, CX, CZ, DE, EK, EY, FM, HO, HU, HX, JQ, KE, KL, LJ, LX, LY, MH, OD, OZ, PG, QR, SQ, TG, TK, TR, UO
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil110_dat_IDX_2 | NONCLUSTERED | non | vot_societe, vot_aller_div_retour, vot_code_vol, vot_date |
| cafil110_dat_IDX_3 | NONCLUSTERED | non | vot_societe, vot_date |
| cafil110_dat_IDX_1 | NONCLUSTERED | oui | vot_societe, vot_aller_div_retour, vot_date, vot_selection, vot_code_vol, vot_compagnie |

