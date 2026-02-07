# histo_fus_sep_detail

| Info | Valeur |
|------|--------|
| Lignes | 20899 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 2516 |
| 2 | `position` | nvarchar | 2 | non |  | 3 |
| 3 | `tasknumber` | int | 10 | non |  | 6 |
| 4 | `wasdone` | bit |  | non |  | 1 |
| 5 | `date_done` | char | 8 | non |  | 660 |
| 6 | `time_done` | char | 6 | non |  | 8511 |
| 7 | `type` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `position` (3 valeurs)

```
1F, 2T, 3E
```

### `tasknumber` (6 valeurs)

```
10, 20, 30, 40, 50, 60
```

### `wasdone` (1 valeurs)

```
1
```

### `type` (2 valeurs)

```
E, F
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| histo_fus_sep_detail_IDX_1 | NONCLUSTERED | oui | chrono, position, tasknumber |

