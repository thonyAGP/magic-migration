# pmsprintparamdefault

| Info | Valeur |
|------|--------|
| Lignes | 52 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `terminal` | int | 10 | non |  | 2 |
| 2 | `edition` | int | 10 | non |  | 52 |
| 3 | `imprimante` | int | 10 | non |  | 5 |
| 4 | `copies` | int | 10 | non |  | 3 |

## Valeurs distinctes

### `terminal` (2 valeurs)

```
0, 999
```

### `imprimante` (5 valeurs)

```
0, 5, 6, 8, 9
```

### `copies` (3 valeurs)

```
0, 1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pmsprintparamdefault_IDX_1 | NONCLUSTERED | oui | terminal, edition, imprimante |

