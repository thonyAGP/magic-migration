# position_reglage_ajustement

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `prj_id` | int | 10 | non |  | 12 |
| 2 | `prj_age_mini` | int | 10 | non |  | 3 |
| 3 | `prj_age_maxi` | int | 10 | non |  | 3 |
| 4 | `prj_nivpra` | int | 10 | non |  | 4 |
| 5 | `prj_ajustement` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `prj_id` (12 valeurs)

```
1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `prj_age_mini` (3 valeurs)

```
0, 11, 50
```

### `prj_age_maxi` (3 valeurs)

```
10, 49, 999
```

### `prj_nivpra` (4 valeurs)

```
1, 2, 3, 4
```

### `prj_ajustement` (4 valeurs)

```
0, 1, -1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| position_reglage_ajustement_IDX_1 | NONCLUSTERED | oui | prj_id |

