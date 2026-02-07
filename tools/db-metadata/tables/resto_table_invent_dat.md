# resto_table_invent_dat

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `resto_id` | nvarchar | 5 | non |  | 3 |
| 2 | `section` | nvarchar | 1 | non |  | 3 |
| 3 | `table_id` | nvarchar | 3 | non |  | 6 |
| 4 | `description` | nvarchar | 15 | non |  | 7 |
| 5 | `nb_of_tables` | int | 10 | non |  | 7 |
| 6 | `nb_people_max` | int | 10 | non |  | 7 |

## Valeurs distinctes

### `resto_id` (3 valeurs)

```
, 01, SPEC
```

### `section` (3 valeurs)

```
, 1, 2
```

### `table_id` (6 valeurs)

```
, 00, 01, 02, 04, 05
```

### `description` (7 valeurs)

```
, Chuda New, Tables de 2, Tables de 4, Tables de 5, Tables de 6, Tables de 8
```

### `nb_of_tables` (7 valeurs)

```
0, 1, 10, 13, 4, 5, 6
```

### `nb_people_max` (7 valeurs)

```
0, 16, 25, 26, 36, 40, 8
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resto_table_invent_dat_IDX_1 | NONCLUSTERED | oui | resto_id, section, table_id |

