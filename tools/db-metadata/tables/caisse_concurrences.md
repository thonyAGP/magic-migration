# caisse_concurrences

| Info | Valeur |
|------|--------|
| Lignes | 121 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 121 |
| 2 | `fonction` | nvarchar | 1 | non |  | 2 |
| 3 | `flag_occupe` | nvarchar | 1 | non |  | 1 |
| 4 | `terminal_session` | int | 10 | non |  | 31 |
| 5 | `buffer` | nvarchar | 52 | non |  | 1 |
| 6 | `hostname_session` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `fonction` (2 valeurs)

```
C, R
```

### `flag_occupe` (1 valeurs)

```
N
```

### `terminal_session` (31 valeurs)

```
0, 1, 150, 22, 300, 371, 430, 431, 432, 433, 500, 520, 530, 540, 541, 550, 551, 570, 571, 572, 580, 582, 70, 81, 90, 91, 920, 940, 942, 960, 980
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_concurrences_IDX_1 | NONCLUSTERED | oui | utilisateur |
| caisse_concurrences_IDX_2 | NONCLUSTERED | non | fonction, flag_occupe |

