# cafil043_dat

| Info | Valeur |
|------|--------|
| Lignes | 584 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cre_service_village` | nvarchar | 4 | non |  | 33 |
| 2 | `cre_imputation` | float | 53 | non |  | 129 |
| 3 | `cre_sous_imputation` | int | 10 | non |  | 69 |
| 4 | `cre_libelle` | nvarchar | 15 | non |  | 149 |
| 5 | `cre_pourcent_commission` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `cre_service_village` (33 valeurs)

```
, ANIM, ARZA, AUT1, BABY, BARD, BOUT, CAIS, CMAF, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, GEST, GOLF, HOTE, INFI, LOCV, MAMA, MINI, PARK, PHOT, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `cre_pourcent_commission` (1 valeurs)

```
100
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil043_dat_IDX_2 | NONCLUSTERED | oui | cre_imputation, cre_sous_imputation |
| cafil043_dat_IDX_1 | NONCLUSTERED | oui | cre_service_village, cre_imputation, cre_sous_imputation |

