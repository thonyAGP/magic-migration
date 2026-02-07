# caisse_ref_simp_service

| Info | Valeur |
|------|--------|
| Lignes | 40 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service` | nvarchar | 4 | non |  | 40 |
| 2 | `sous_imputation` | int | 10 | non |  | 40 |

## Valeurs distinctes

### `service` (40 valeurs)

```
ANIM, ARZA, AUT1, AUT2, AUT3, BABY, BARD, BOUT, CAIS, CASI, CMAF, COCL, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, FORM, GEST, GOLF, GPER, HOTE, INFI, LOCV, MAIN, MAMA, MINI, PARK, PHOT, PLAF, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `sous_imputation` (40 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_simp_service_IDX_1 | NONCLUSTERED | oui | service |

