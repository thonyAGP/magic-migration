# pv_hoteldays_dat

| Info | Valeur |
|------|--------|
| Lignes | 1568 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pv_service` | nvarchar | 4 | non |  | 1 |
| 2 | `hdy_date` | char | 8 | non |  | 1568 |
| 3 | `hdy_quantity` | int | 10 | non |  | 516 |
| 4 | `hdy_update` | float | 53 | non |  | 1568 |
| 5 | `hdy_user` | nvarchar | 8 | non |  | 34 |

## Valeurs distinctes

### `hdy_user` (34 valeurs)

```
ANN, APPLE, AUNKO, BEAM, DSIOP, EMELINE, EVE, FAJAR, FAM, GIFT, ING, JAA, JOLIE, LYN, LYS, MEL, MICKY, MIND, NANA, NUENG, PIGGY, PLANNING, PRYME, REMI, RERE, RITA, SNOW, STEPHANY, SUNNY, TEMMY, TIK, TRAFFIC, WELCMGR, YOHAN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_hoteldays_dat_IDX_1 | NONCLUSTERED | oui | pv_service, hdy_date |

