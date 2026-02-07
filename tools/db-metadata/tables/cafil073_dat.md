# cafil073_dat

| Info | Valeur |
|------|--------|
| Lignes | 14 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tgr_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tgr_point_de_vente` | nvarchar | 6 | non |  | 4 |
| 3 | `tgr_imputation` | float | 53 | non |  | 13 |
| 4 | `tgr_sous_imputation` | int | 10 | non |  | 4 |
| 5 | `tgr_libelle` | nvarchar | 20 | non |  | 11 |

## Valeurs distinctes

### `tgr_societe` (1 valeurs)

```
C
```

### `tgr_point_de_vente` (4 valeurs)

```
BARD, BOUT, ESTH, STAN
```

### `tgr_imputation` (13 valeurs)

```
7.06415e+008, 7.0641e+008, 7.0642e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008
```

### `tgr_sous_imputation` (4 valeurs)

```
101, 17, 7, 8
```

### `tgr_libelle` (11 valeurs)

```
ALCOHOL BSI, ALCOHOL HBSI, Baln?o/ Esth?ti, Boutique, BTQ, FINE DINING, GROCERY, NON ALCOHOL BSI, PHONE ROOMS, ROOM SERVICE, TOBACCO
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil073_dat_IDX_1 | NONCLUSTERED | oui | tgr_societe, tgr_point_de_vente, tgr_imputation, tgr_sous_imputation |

