# pv_contracts_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tco_code` | int | 10 | non |  | 2 |
| 2 | `tco_description` | nvarchar | 30 | non |  | 2 |
| 3 | `tco_salaire_moyen` | float | 53 | non |  | 1 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `tco_code` (2 valeurs)

```
1, 2
```

### `tco_description` (2 valeurs)

```
Euro, Local
```

### `tco_salaire_moyen` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_contracts_dat_IDX_1 | NONCLUSTERED | oui | pv_service, tco_code |

