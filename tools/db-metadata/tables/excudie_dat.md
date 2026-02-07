# excudie_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `die_type` | nvarchar | 1 | non |  | 1 |
| 2 | `die_code` | int | 10 | non |  | 1 |
| 3 | `die_valeur` | nvarchar | 4 | non |  | 2 |
| 4 | `die_flag` | nvarchar | 1 | non |  | 1 |
| 5 | `die_zone_numerique` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `die_type` (1 valeurs)

```
1
```

### `die_code` (1 valeurs)

```
1
```

### `die_valeur` (2 valeurs)

```
1, LANG
```

### `die_flag` (1 valeurs)

```
N
```

### `die_zone_numerique` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excudie_dat_IDX_1 | NONCLUSTERED | oui | die_type, die_code, die_valeur, die_flag |
| excudie_dat_IDX_2 | NONCLUSTERED | oui | die_flag, die_type, die_code, die_valeur |

