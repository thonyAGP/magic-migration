# caisse_central_moyen_paiement

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code` | nvarchar | 5 | non |  | 6 |
| 3 | `numero` | int | 10 | non |  | 4 |
| 4 | `classe` | nvarchar | 6 | non |  | 4 |
| 5 | `libelle` | nvarchar | 20 | non |  | 6 |
| 6 | `maj` | nvarchar | 1 | non |  | 2 |
| 7 | `compte` | int | 10 | non |  | 6 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code` (6 valeurs)

```
AMEX, CASH, CCAU, CHQ, OD, VISA
```

### `numero` (4 valeurs)

```
1, 2, 3, 4
```

### `classe` (4 valeurs)

```
$CARD, $CASH, $PAPER, OD
```

### `libelle` (6 valeurs)

```
American express, Autre carte crÃ©dit, ChÃ¨ques Travellers, EspÃ¨ces, OD Club Med Pass, Visa
```

### `maj` (2 valeurs)

```
, O
```

### `compte` (6 valeurs)

```
411111, 511100, 511310, 511320, 511330, 532188
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_moyen_paiement_IDX_1 | NONCLUSTERED | oui | societe, numero, code |

