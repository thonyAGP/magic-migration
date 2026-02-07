# taitype

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | nvarchar | 2 | non |  | 4 |
| 2 | `libelle` | nvarchar | 6 | non |  | 2 |
| 3 | `age_mini` | int | 10 | non |  | 4 |
| 4 | `age_maxi` | int | 10 | non |  | 4 |
| 5 | `libelle_standard` | nvarchar | 12 | non |  | 4 |

## Valeurs distinctes

### `code` (4 valeurs)

```
01, 02, 03, 04
```

### `libelle` (2 valeurs)

```
ADULTS, KIDS
```

### `age_mini` (4 valeurs)

```
0, 12, 18, 4
```

### `age_maxi` (4 valeurs)

```
11, 17, 3, 999
```

### `libelle_standard` (4 valeurs)

```
ADULTS, KIDS 00-03, KIDS 04-11, KIDS 12-17
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taitype_IDX_1 | NONCLUSTERED | oui | code |

