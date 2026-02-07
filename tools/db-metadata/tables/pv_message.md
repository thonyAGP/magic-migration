# pv_message

**Nom logique Magic** : `pv_message`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pv_service` | nvarchar | 4 | non |  | 2 |
| 2 | `pv_type_message` | nvarchar | 1 | non |  | 1 |
| 3 | `pv_date_debut_val_message` | char | 8 | non |  | 2 |
| 4 | `pv_date_fin_val_message` | char | 8 | non |  | 2 |
| 5 | `pv_message_defaut` | nvarchar | 500 | non |  | 2 |
| 6 | `pv_message_autre` | nvarchar | 500 | non |  | 1 |
| 7 | `pv_rowid` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `pv_service` (2 valeurs)

```
BARD, ESTH
```

### `pv_type_message` (1 valeurs)

```
D
```

### `pv_date_debut_val_message` (2 valeurs)

```
20170318, 20241005
```

### `pv_date_fin_val_message` (2 valeurs)

```
20170318, 20241005
```

### `pv_message_defaut` (2 valeurs)

```
 , Thank you
```

### `pv_message_autre` (1 valeurs)

```
 
```

### `pv_rowid` (2 valeurs)

```
1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_message_IDX_1 | NONCLUSTERED | oui | pv_service, pv_type_message, pv_date_debut_val_message, pv_date_fin_val_message, pv_rowid |

