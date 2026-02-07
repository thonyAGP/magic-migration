# caisse_central_classe_monetaire

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero` | int | 10 | non |  | 6 |
| 3 | `classe` | nvarchar | 6 | non |  | 6 |
| 4 | `libelle` | nvarchar | 20 | non |  | 6 |
| 5 | `maj` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `numero` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `classe` (6 valeurs)

```
$CARD, $CASH, $PAPER, CHGE, OD, PERS
```

### `libelle` (6 valeurs)

```
Cartes de crÃ©dit, Change, EspÃ¨ces, Garantie personnelle, Monnaie papier, O.D.
```

### `maj` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_classe_monetaire_IDX_1 | NONCLUSTERED | oui | societe, numero |

