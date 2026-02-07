# pv_inv_stock

**Nom logique Magic** : `pv_inv_stock`

| Info | Valeur |
|------|--------|
| Lignes | 97 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `inv_service` | nvarchar | 4 | non |  | 2 |
| 2 | `inv_chrono` | int | 10 | non |  | 85 |
| 3 | `inv_date_dern_modif` | char | 8 | non |  | 86 |
| 4 | `inv_heure_dern_modif` | char | 6 | non |  | 97 |
| 5 | `inv_date_validation` | char | 8 | non |  | 87 |
| 6 | `inv_heure_validation` | char | 6 | non |  | 96 |
| 7 | `inv_user_dern_modif` | nvarchar | 8 | non |  | 2 |
| 8 | `inv_user_validation` | nvarchar | 8 | non |  | 3 |
| 9 | `inv_valide` | bit |  | non |  | 2 |

## Valeurs distinctes

### `inv_service` (2 valeurs)

```
BARD, ESTH
```

### `inv_user_dern_modif` (2 valeurs)

```
BARMGR, SPAMGR
```

### `inv_user_validation` (3 valeurs)

```
, BARMGR, SPAMGR
```

### `inv_valide` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_inv_stock_IDX_1 | NONCLUSTERED | oui | inv_service, inv_chrono |

