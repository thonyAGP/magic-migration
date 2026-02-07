# caisse_central_compte_produit

| Info | Valeur |
|------|--------|
| Lignes | 462 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cre_service_village` | nvarchar | 4 | non |  | 31 |
| 2 | `cre_imputation` | float | 53 | non |  | 113 |
| 3 | `cre_sous_imputation` | int | 10 | non |  | 31 |
| 4 | `cre_libelle` | nvarchar | 64 | non |  | 56 |
| 5 | `cre_pointage` | bit |  | non |  | 1 |

## Valeurs distinctes

### `cre_service_village` (31 valeurs)

```
ANIM, ARZA, BABY, BARD, BOUT, CAIS, CMAF, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, GEST, GOLF, HOTE, INFI, LOCV, MAMA, MINI, PARK, PHOT, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `cre_sous_imputation` (31 valeurs)

```
1, 11, 13, 14, 15, 16, 17, 18, 19, 2, 21, 22, 24, 25, 26, 28, 29, 30, 31, 33, 34, 35, 36, 37, 38, 39, 40, 6, 7, 8, 9
```

### `cre_pointage` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_compte_produit_IDX_2 | NONCLUSTERED | non | cre_imputation, cre_sous_imputation |
| caisse_central_compte_produit_IDX_1 | NONCLUSTERED | oui | cre_service_village, cre_imputation, cre_sous_imputation |

