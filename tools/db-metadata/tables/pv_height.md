# pv_height

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pht_id` | int | 10 | non |  | 6 |
| 2 | `pht_label` | nvarchar | 128 | non |  | 6 |
| 3 | `pht_service` | nvarchar | 4 | non |  | 1 |
| 4 | `pht_height_min` | int | 10 | non |  | 6 |
| 5 | `pht_height_max` | int | 10 | non |  | 6 |

## Valeurs distinctes

### `pht_id` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `pht_label` (6 valeurs)

```
148 CM OR LESS / 4'10'' OR LESS, 149-157 CM / 4'11''-5'1'', 158-166 CM / 5'2''-5'5'', 167-178 CM / 5'6''-5'10'', 179-194 CM / 5'11''-6'4'', 195 CM AND MORE / 6'5'' AND MORE
```

### `pht_service` (1 valeurs)

```
SKIN
```

### `pht_height_min` (6 valeurs)

```
0, 149, 158, 167, 179, 195
```

### `pht_height_max` (6 valeurs)

```
148, 157, 166, 178, 194, 999
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_height_IDX_1 | NONCLUSTERED | oui | pht_id |

