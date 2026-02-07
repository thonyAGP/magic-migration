# pmslisting

| Info | Valeur |
|------|--------|
| Lignes | 58 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | int | 10 | non |  | 58 |
| 2 | `libelle_fra` | nvarchar | 64 | non |  | 56 |
| 3 | `libelle_ang` | nvarchar | 64 | non |  | 11 |
| 4 | `imprimantes_disponibles` | nvarchar | 20 | non |  | 9 |
| 5 | `programme_v8` | nvarchar | 3 | non |  | 9 |
| 6 | `programme_v8_libelle` | nvarchar | 30 | non |  | 9 |
| 7 | `copies` | int | 10 | non |  | 2 |
| 8 | `enable` | bit |  | non |  | 2 |

## Valeurs distinctes

### `libelle_ang` (11 valeurs)

```
, ACCOUNT STATEMENT, ACCOUNT STATEMENT BY SERVICE, BAR LIMITS, CABIN RECIEPT, CANCELLATION TICKET, CHANGE TICKET, DUPLICATE TICKET, EXCURSIONS SALES, EZCARD SALES, TRANSFERS
```

### `imprimantes_disponibles` (9 valeurs)

```
000000011, 100000010, 100001000, 100001011, 100001011	, 100010000, 100100011, 100101011, 100110011
```

### `programme_v8` (9 valeurs)

```
ADH, BFO, CAB, CAP, EXB, EXF, ODL, PVE, REQ
```

### `programme_v8_libelle` (9 valeurs)

```
ARCHIVES CAISSE ADHERENT, BARFO, CABINE, CAISSE ADHERENT, EXCURSION FRONT, EXCURSIONS BACK OFFICE, OD LIGHT, PVENTE, REQUEST
```

### `copies` (2 valeurs)

```
1, 2
```

### `enable` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pmslisting_IDX_1 | NONCLUSTERED | oui | chrono |

