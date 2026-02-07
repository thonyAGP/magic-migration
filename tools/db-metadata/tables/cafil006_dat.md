# cafil006_dat

| Info | Valeur |
|------|--------|
| Lignes | 15 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `uss_user` | nvarchar | 8 | non |  | 4 |
| 2 | `uss_service` | nvarchar | 4 | non |  | 15 |

## Valeurs distinctes

### `uss_user` (4 valeurs)

```
FAM, FOM, MURAT, STEVEN
```

### `uss_service` (15 valeurs)

```
ANIM, ARZA, CAIS, CMAF, COMM, ECON, GEST, GOLF, GPER, HOTE, MAIN, MAMA, PLAN, REST, TRAF
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil006_dat_IDX_1 | NONCLUSTERED | oui | uss_service, uss_user |

