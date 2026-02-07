# pv_manufacturer_dat

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `manufacturer_id` | int | 10 | non |  | 7 |
| 2 | `manufacturer_name` | nvarchar | 20 | non |  | 7 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `manufacturer_id` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `manufacturer_name` (7 valeurs)

```
Atomic, Hammer, Inook, Rossignol, Salomon, Volant, X
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_manufacturer_dat_IDX_1 | NONCLUSTERED | oui | pv_service, manufacturer_id |

