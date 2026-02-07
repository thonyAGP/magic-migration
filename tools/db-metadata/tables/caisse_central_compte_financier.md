# caisse_central_compte_financier

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code` | nvarchar | 5 | non |  | 7 |
| 3 | `numero` | int | 10 | non |  | 5 |
| 4 | `classe` | nvarchar | 6 | non |  | 5 |
| 5 | `libelle` | nvarchar | 64 | non |  | 7 |
| 6 | `maj` | nvarchar | 1 | non |  | 2 |
| 7 | `compte` | int | 10 | non |  | 7 |
| 8 | `pointage` | bit |  | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code` (7 valeurs)

```
AMEX, CASH, CCAU, CHGE, CHQ, OD, VISA
```

### `numero` (5 valeurs)

```
1, 2, 3, 4, 6
```

### `classe` (5 valeurs)

```
$CARD, $CASH, $PAPER, CHGE, OD
```

### `libelle` (7 valeurs)

```
Autre carte de crÃ©dit, Club Med Pass, EspÃ¨ces, RECAP Change, TPE American Express, TPE Visa, Traveller
```

### `maj` (2 valeurs)

```
, O
```

### `compte` (7 valeurs)

```
411111, 511100, 511310, 511320, 511330, 532188, 532488
```

### `pointage` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_compte_financier_IDX_1 | NONCLUSTERED | oui | societe, numero, code |

