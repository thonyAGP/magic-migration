# pv_status_dat

| Info | Valeur |
|------|--------|
| Lignes | 11 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `status` | nvarchar | 10 | non |  | 11 |
| 2 | `description` | nvarchar | 50 | non |  | 11 |
| 3 | `prevent_modif__` | bit |  | non |  | 2 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `status` (11 valeurs)

```
Accident, Broken, In, In-INV, Lost, Out, Pending In, Purge, Purge-INV, Repair, Stolen
```

### `description` (11 valeurs)

```
Broken equipment, Equipment currently in use, Equipment in stock, Equipment involved in an accident, Equipment reported lost, Equipment stolen, Equipment that need repair, Equipment to be checked in immediately, Equipment to be purged, Inventory => In, Inventory => Purge
```

### `prevent_modif__` (2 valeurs)

```
0, 1
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_status_dat_IDX_2 | NONCLUSTERED | oui | pv_service, description, status |
| pv_status_dat_IDX_1 | NONCLUSTERED | oui | pv_service, status |

