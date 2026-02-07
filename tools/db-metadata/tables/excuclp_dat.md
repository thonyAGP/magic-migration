# excuclp_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cla_code` | nvarchar | 1 | non |  | 1 |
| 2 | `cla_numero` | int | 10 | non |  | 2 |
| 3 | `cla_paiement` | nvarchar | 4 | non |  | 2 |

## Valeurs distinctes

### `cla_numero` (2 valeurs)

```
1, 2
```

### `cla_paiement` (2 valeurs)

```
CASH, OD
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excuclp_dat_IDX_1 | NONCLUSTERED | oui | cla_code, cla_numero |

