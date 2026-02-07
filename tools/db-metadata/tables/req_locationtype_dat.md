# req_locationtype_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `req__type_loc` | nvarchar | 8 | non |  | 2 |
| 2 | `location_desc` | nvarchar | 20 | non |  | 2 |
| 3 | `index_` | nvarchar | 2 | non |  | 1 |

## Valeurs distinctes

### `req__type_loc` (2 valeurs)

```
ROOM, SERVICE
```

### `location_desc` (2 valeurs)

```
Rooms, Village Services
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_locationtype_dat_IDX_2 | NONCLUSTERED | oui | index_, req__type_loc |
| req_locationtype_dat_IDX_1 | NONCLUSTERED | oui | req__type_loc |

