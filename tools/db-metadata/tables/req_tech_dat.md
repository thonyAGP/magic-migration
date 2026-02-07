# req_tech_dat

| Info | Valeur |
|------|--------|
| Lignes | 15 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dispatch_id` | nvarchar | 5 | non |  | 3 |
| 2 | `intervenant_id` | nvarchar | 3 | non |  | 15 |
| 3 | `intervenant_desc` | nvarchar | 20 | non |  | 15 |

## Valeurs distinctes

### `dispatch_id` (3 valeurs)

```
HOUSE, MAINT, RECEP
```

### `intervenant_id` (15 valeurs)

```
AC, CAR, ELE, HK1, MAS, MEC, MNG, OTH, PA, PAI, PLA, PLB, ROU, TRA, VAR
```

### `intervenant_desc` (15 valeurs)

```
 COMMUN AREA SUPERVI,  ROOM SUPERVISOR, AirCond Tech, CARPENTER, ELECTRICIEN, MASON, MECHANIC, OTHER, PAINTER, Planning, PLUMBER, Reception manager, ROUTINE, Traffic, VARIOUS
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_tech_dat_IDX_1 | NONCLUSTERED | oui | dispatch_id, intervenant_id |

