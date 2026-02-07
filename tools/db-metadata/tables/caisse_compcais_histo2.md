# caisse_compcais_histo2

| Info | Valeur |
|------|--------|
| Lignes | 6537 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hisuser` | nvarchar | 8 | non |  | 32 |
| 2 | `hisquand` | nvarchar | 1 | non |  | 2 |
| 3 | `hischronohisto` | float | 53 | non |  | 293 |
| 4 | `hisordre` | int | 10 | non |  | 19 |
| 5 | `histype` | nvarchar | 3 | non |  | 9 |
| 6 | `hislibelle` | nvarchar | 16 | non |  | 18 |
| 7 | `hisprixunitaire` | float | 53 | non |  | 14 |
| 8 | `hisquantite` | int | 10 | non |  | 88 |
| 9 | `hismontant` | float | 53 | non |  | 472 |
| 10 | `hisdatesaisie` | char | 8 | non |  | 70 |
| 11 | `hisheuresaisie` | char | 6 | non |  | 342 |
| 12 | `hischronosession` | float | 53 | non |  | 84 |
| 13 | `hiscodearticle` | int | 10 | non |  | 5 |
| 14 | `hiszoom` | nvarchar | 4 | non |  | 2 |

## Valeurs distinctes

### `hisuser` (32 valeurs)

```
APPLE, ARKON, ASSTFAM, AUNKO, BATU, BEAM, DADA, DOREEN, DORI, ESTELLE, EVE, FAJAR, FAM, GIFT, ING, JAA, JAA1, JOLIE, JOY, JULIA, KIMMY, MICKY, MIMI, MIND, OAT, PEPSI, PLANNING, REMI, TEMMY, TIK, TOMOKA, WELCMGR
```

### `hisquand` (2 valeurs)

```
F, O
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
, 1D PREMIUM, 1D SILVER, 1W SILVER M, 7D PREMIUM, Billets, Bills, CARTES BANCAIRES, CHECKS, CHEQUES, CIGARETTES, Coins, CREDIT CARDS, Currencies, Debit on account, DÃ©bit sur compte, Devises, PiÃ¨ces
```

### `hisprixunitaire` (14 valeurs)

```
0, 1, 10, 100, 1000, 105, 1300, 2, 20, 210, 5, 50, 500, 650
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
| caisse_compcais_histo2_IDX_1 | NONCLUSTERED | oui | hisuser, hischronohisto, hisordre |
| caisse_compcais_histo2_IDX_2 | NONCLUSTERED | non | hisuser, hischronosession, histype, hischronohisto |

