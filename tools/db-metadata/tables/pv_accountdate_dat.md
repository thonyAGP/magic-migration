# pv_accountdate_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dat_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `dat_date_comptable` | char | 8 | non |  | 1 |
| 3 | `dat_pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `dat_societe` (1 valeurs)

```
C
```

### `dat_date_comptable` (1 valeurs)

```
19010101
```

### `dat_pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_accountdate_dat_IDX_1 | NONCLUSTERED | oui | dat_societe, dat_pv_service |

