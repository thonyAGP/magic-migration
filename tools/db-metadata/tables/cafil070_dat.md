# cafil070_dat

| Info | Valeur |
|------|--------|
| Lignes | 27 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pdv_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `pdv_point_de_vente` | nvarchar | 6 | non |  | 27 |
| 3 | `pdv_libelle` | nvarchar | 20 | non |  | 27 |
| 4 | `pdv_borne_vend__min` | int | 10 | non |  | 1 |
| 5 | `pdv_borne_vend__max` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `pdv_societe` (1 valeurs)

```
C
```

### `pdv_point_de_vente` (27 valeurs)

```
ARZA, AUTR, BALL, BAR, BOUT, CAIS, CASI, COIF, EQUI, ESTH, EXCU, FITN, GEST, GOLF, HOTE, INFI, LOCV, MEDA, PARK, PHOT, PLAN, PRES, REST, SKI, STAN, TRAF, VELO
```

### `pdv_libelle` (27 valeurs)

```
arts appliquÃ©s, autres, balltrap, bar, boutique, caisse, casino, coiffure, Ã©quitation, esthÃ©tique, excursion, fitness, gestion, golf, hotesse, infirmerie, location voitures, mÃ©daille/inscription, parking, photographe, planning, pressing, restaurant, ski, standard, trafic, vÃ©lo
```

### `pdv_borne_vend__min` (1 valeurs)

```
0
```

### `pdv_borne_vend__max` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil070_dat_IDX_1 | NONCLUSTERED | oui | pdv_societe, pdv_point_de_vente |

