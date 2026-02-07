# pv_skiertype_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type` | nvarchar | 5 | non |  | 3 |
| 2 | `name` | nvarchar | 20 | non |  | 3 |
| 3 | `description` | nvarchar | 400 | non |  | 3 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `type` (3 valeurs)

```
I, II, III
```

### `name` (3 valeurs)

```
TYPE I, TYPE II, TYPE III
```

### `description` (3 valeurs)

```
SKI AGGRESSIVELY

> Prefer faster speeds
> Prefer fast and aggressive skiing on slopes of moderate to steep pitch
> Prefer higher than average release/retention settings
> Prefer decreased releas, SKI CAUTIOUSLY 

> Prefer slower speeds
> Prefer cautious skiing on smooth slopes of gentle to moderate pitch
> Prefer lower than average release/retention settings
> Prefer an increased risk of , SKI MODERATELY

> Prefer a variety of speeds
> Prefer to ski on varied terrain
> Skiers not classified as either Type I or Type III
> Prefer average release/retention settings appropriate for mos
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_skiertype_dat_IDX_1 | NONCLUSTERED | oui | pv_service, type |

