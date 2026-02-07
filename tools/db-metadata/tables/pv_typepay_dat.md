# pv_typepay_dat

| Info | Valeur |
|------|--------|
| Lignes | 200 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `description` | nvarchar | 15 | non |  | 5 |
| 2 | `block_refund` | bit |  | non |  | 2 |
| 3 | `pms_transaction__` | bit |  | non |  | 2 |
| 4 | `free__` | bit |  | non |  | 2 |
| 5 | `pv_service` | nvarchar | 4 | non |  | 40 |
| 6 | `supprime_292` | bit |  | non |  | 2 |

## Valeurs distinctes

### `description` (5 valeurs)

```
CLUBMED PASS, CREDIT CARD, FREE, PREPAID, REFUSAL TO SELL
```

### `block_refund` (2 valeurs)

```
0, 1
```

### `pms_transaction__` (2 valeurs)

```
0, 1
```

### `free__` (2 valeurs)

```
0, 1
```

### `pv_service` (40 valeurs)

```
ANIM, ARZA, AUT1, AUT2, AUT3, BABY, BARD, BOUT, CAIS, CASI, CMAF, COCL, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, FORM, GEST, GOLF, GPER, HOTE, INFI, LOCV, MAIN, MAMA, MINI, PARK, PHOT, PLAF, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `supprime_292` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_typepay_dat_IDX_1 | NONCLUSTERED | oui | pv_service, description |

