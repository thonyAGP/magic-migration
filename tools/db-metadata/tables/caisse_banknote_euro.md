# caisse_banknote_euro

| Info | Valeur |
|------|--------|
| Lignes | 15 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ordre` | int | 10 | non |  | 15 |
| 2 | `billet` | bit |  | non |  | 2 |
| 3 | `piece` | bit |  | non |  | 2 |
| 4 | `valeur` | float | 53 | non |  | 15 |

## Valeurs distinctes

### `ordre` (15 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 8, 9
```

### `billet` (2 valeurs)

```
0, 1
```

### `piece` (2 valeurs)

```
0, 1
```

### `valeur` (15 valeurs)

```
0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 10, 100, 2, 20, 200, 5, 50, 500
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_banknote_euro_IDX_1 | NONCLUSTERED | oui | valeur |

