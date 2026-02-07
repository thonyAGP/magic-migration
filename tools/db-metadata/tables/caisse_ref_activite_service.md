# caisse_ref_activite_service

| Info | Valeur |
|------|--------|
| Lignes | 43 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `activite_du_plan_comptable` | int | 10 | non |  | 33 |
| 3 | `service_de_pms` | nvarchar | 4 | non |  | 31 |
| 4 | `compte_de_charge___not_used` | bit |  | non |  | 2 |
| 5 | `compte_de_bilan___not_used` | bit |  | non |  | 2 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `activite_du_plan_comptable` (33 valeurs)

```
110, 115, 201, 205, 210, 215, 230, 239, 254, 255, 256, 257, 271, 272, 273, 274, 276, 277, 278, 279, 295, 325, 340, 350, 360, 382, 384, 385, 391, 395, 405, 417, 421
```

### `service_de_pms` (31 valeurs)

```
ANIM, ARZA, BABY, BARD, BOUT, CAIS, CMAF, COIF, COMM, ECON, EQUI, ESTH, EXCU, FITN, GEST, GOLF, HOTE, INFI, LOCV, MAIN, MAMA, MINI, PARK, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `compte_de_charge___not_used` (2 valeurs)

```
0, 1
```

### `compte_de_bilan___not_used` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_activite_service_IDX_1 | NONCLUSTERED | oui | societe, activite_du_plan_comptable, service_de_pms |
| caisse_ref_activite_service_IDX_2 | NONCLUSTERED | oui | societe, service_de_pms, activite_du_plan_comptable |

