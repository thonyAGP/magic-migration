# pv_weight

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pwt_id` | int | 10 | non |  | 13 |
| 2 | `pwt_label` | nvarchar | 128 | non |  | 13 |
| 3 | `pwt_service` | nvarchar | 4 | non |  | 1 |
| 4 | `pwt_weight_min` | int | 10 | non |  | 13 |
| 5 | `pwt_weight_max` | int | 10 | non |  | 13 |

## Valeurs distinctes

### `pwt_id` (13 valeurs)

```
1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9
```

### `pwt_label` (13 valeurs)

```
10-13 KG / 22-29 LBS, 14-17 KG / 30-38 LBS, 18-21 KG / 39-47 LBS, 22-25 KG / 48-56 LBS, 26-30 KG / 57-66 LBS, 31-35 KG / 67-78 LBS, 36-41 KG / 79-91 LBS, 42-48 KG / 92-107 LBS, 49-57 KG / 108-125 LBS, 58-66 KG / 126-147 LBS, 67-78 KG / 148-174 LBS, 79-94 KG / 175-209 LBS, 95 KG AND MORE / 210 LBS AND MORE
```

### `pwt_service` (1 valeurs)

```
SKIN
```

### `pwt_weight_min` (13 valeurs)

```
10, 14, 18, 22, 26, 31, 36, 42, 49, 58, 67, 79, 95
```

### `pwt_weight_max` (13 valeurs)

```
13, 17, 21, 25, 30, 35, 41, 48, 57, 66, 78, 94, 999
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_weight_IDX_1 | NONCLUSTERED | oui | pwt_id |

