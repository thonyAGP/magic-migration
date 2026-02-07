# caisse_banknote

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ordre` | int | 10 | non |  | 9 |
| 2 | `billet` | bit |  | non |  | 2 |
| 3 | `piece` | bit |  | non |  | 2 |
| 4 | `valeur` | float | 53 | non |  | 9 |

## Valeurs distinctes

### `ordre` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `billet` (2 valeurs)

```
0, 1
```

### `piece` (2 valeurs)

```
0, 1
```

### `valeur` (9 valeurs)

```
1, 10, 100, 1000, 2, 20, 5, 50, 500
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_banknote_IDX_1 | NONCLUSTERED | oui | valeur |

