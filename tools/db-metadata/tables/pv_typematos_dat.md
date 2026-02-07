# pv_typematos_dat

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_matos_id` | int | 10 | non |  | 13 |
| 2 | `description` | nvarchar | 15 | non |  | 13 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 1 |
| 4 | `type` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `type_matos_id` (13 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 2, 4, 5, 7, 8, 9
```

### `description` (13 valeurs)

```
Assurance, Batons, Casque, Chauss.Montagne, Chauss.Nordique, Chauss.Ski, Chauss.Snow, Micro Board, Raquette, Services, Ski, Snowblade, Snowboard
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_typematos_dat_IDX_1 | NONCLUSTERED | oui | pv_service, type_matos_id |
| pv_typematos_dat_IDX_2 | NONCLUSTERED | oui | pv_service, description, type_matos_id |

