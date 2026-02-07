# req_pb_dat

| Info | Valeur |
|------|--------|
| Lignes | 22 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dispatch_id` | nvarchar | 5 | non |  | 3 |
| 2 | `type_pb_id` | nvarchar | 3 | non |  | 22 |
| 3 | `type_pb_desc` | nvarchar | 15 | non |  | 22 |

## Valeurs distinctes

### `dispatch_id` (3 valeurs)

```
HOUSE, MAINT, RECEP
```

### `type_pb_id` (22 valeurs)

```
AC, AMN, CAR, CLE, ELE, FUR, INS, INT, KEY, LIN, MAS, MEC, OTH, PAI, PHO, PLB, ROM, SAF, TSF, TV, VAR, WAT
```

### `type_pb_desc` (22 valeurs)

```
Air Con/Fridge, Amenities, Carpentery, Change flight, Change room, Cleaning, Electricity, Furniture, Insects, Internet, Key, Linen problem, Mason / Tiles, Mechanic, Others, Painting, Phone, Plumbing, Safe, TV, Various, WATER
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_pb_dat_IDX_1 | NONCLUSTERED | oui | dispatch_id, type_pb_id |
| req_pb_dat_IDX_2 | NONCLUSTERED | non | type_pb_id |

