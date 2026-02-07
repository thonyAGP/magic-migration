# req_location_dat

| Info | Valeur |
|------|--------|
| Lignes | 173 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_location` | nvarchar | 8 | non |  | 2 |
| 2 | `service` | nvarchar | 6 | non |  | 13 |
| 3 | `location` | nvarchar | 20 | non |  | 44 |
| 4 | `site` | nvarchar | 20 | non |  | 150 |

## Valeurs distinctes

### `type_location` (2 valeurs)

```
ROOM, SERVICE
```

### `service` (13 valeurs)

```
, ANIM, BAR, BOUT, DIVER, ECO, HOUSE, MAINT, MC, OFFI, RECEP, RESTO, SPORT
```

### `location` (44 valeurs)

```
, Anim, Balcony, Bar, Bar Area, Bathroom, Bedroom, Boutique, Chu Da, Chu Da Kitchen, Chu Da Restaurant, Commn Areas, Commun Areas, Decou, Decouverte, Departure loundge, Disco, Divers, Electrical Distribut, Entrance, F&B, Hair dresser, HR Area, Infir, Kitchen Area, Laundry, Machine Room, Main Kitchen, MC, Mini club, Office Area, Photo, Pool, Recep, Restaurant, Scuba, Sewage Plant, Spa, SPA, Sport, Tailor, TS Area, WC, Workshop
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_location_dat_IDX_1 | NONCLUSTERED | oui | type_location, service, location, site |

