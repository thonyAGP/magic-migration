# caisse_coffre_compcais_histo2

| Info | Valeur |
|------|--------|
| Lignes | 190 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hisuser` | nvarchar | 8 | non |  | 2 |
| 2 | `hisquand` | nvarchar | 1 | non |  | 1 |
| 3 | `hischronohisto` | float | 53 | non |  | 10 |
| 4 | `hisordre` | int | 10 | non |  | 19 |
| 5 | `histype` | nvarchar | 3 | non |  | 9 |
| 6 | `hislibelle` | nvarchar | 16 | non |  | 18 |
| 7 | `hisprixunitaire` | float | 53 | non |  | 14 |
| 8 | `hisquantite` | int | 10 | non |  | 22 |
| 9 | `hismontant` | float | 53 | non |  | 36 |
| 10 | `hisdatesaisie` | char | 8 | non |  | 2 |
| 11 | `hisheuresaisie` | char | 6 | non |  | 10 |
| 12 | `hischronosession` | float | 53 | non |  | 1 |
| 13 | `hiscodearticle` | int | 10 | non |  | 5 |
| 14 | `hiszoom` | nvarchar | 4 | non |  | 2 |

## Valeurs distinctes

### `hisuser` (2 valeurs)

```
ASSTFAM, FAM
```

### `hischronohisto` (10 valeurs)

```
2396, 2397, 2398, 2399, 2400, 756, 757, 758, 759, 760
```

### `hisordre` (19 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `histype` (9 valeurs)

```
, ART, BIL, CAR, CHE, CIG, DEV, OD, PIE
```

### `hislibelle` (18 valeurs)

```
, 1D PREMIUM, 1D SILVER, 1W SILVER M, 7D PREMIUM, Billets, Bills, CARTES BANCAIRES, CHECKS, CHEQUES, CIGARETTES, Coins, CREDIT CARDS, Currencies, debit on account, Debit sur compte, Devises, PiÃ¨ces
```

### `hisprixunitaire` (14 valeurs)

```
0, 1, 10, 100, 1000, 105, 1300, 2, 20, 210, 5, 50, 500, 650
```

### `hisquantite` (22 valeurs)

```
0, 120, 123, 124, 125, 126, 18, 200, 201, 203, 212, 270, 321, 345, 375, 439, 496, 5, 63, 64, 74, 87
```

### `hismontant` (36 valeurs)

```
0, 0.17, -0.17, 0.3, 0.6, 0.7, 106000, 123, 124, 125, 126, 13500, 181366, 181374, 181375, 200000, 201, 203, 21950, 240, 297271, 297273, 32100, 37500, 43500, 5000, 630, 640, 6900, 740, 90, 9920
```

### `hisdatesaisie` (2 valeurs)

```
20251118, 20251224
```

### `hisheuresaisie` (10 valeurs)

```
212334, 212401, 212546, 212712, 212802, 224350, 224409, 224422, 224437, 224447
```

### `hischronosession` (1 valeurs)

```
0
```

### `hiscodearticle` (5 valeurs)

```
0, 553, 554, 555, 557
```

### `hiszoom` (2 valeurs)

```
, Zoom
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_coffre_compcais_histo2_IDX_1 | NONCLUSTERED | oui | hisuser, hischronohisto, hisordre |
| caisse_coffre_compcais_histo2_IDX_2 | NONCLUSTERED | non | hisuser, hischronosession, histype, hischronohisto |

