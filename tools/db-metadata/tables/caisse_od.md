# caisse_od

| Info | Valeur |
|------|--------|
| Lignes | 9346 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1381 |
| 3 | `service` | nvarchar | 4 | non |  | 10 |
| 4 | `mop_od` | nvarchar | 4 | non |  | 1 |
| 5 | `montant_calcule` | float | 53 | non |  | 5725 |
| 6 | `montant_saisi` | float | 53 | non |  | 5834 |
| 7 | `ecart` | bit |  | non |  | 2 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA
```

### `mop_od` (1 valeurs)

```
OD
```

### `ecart` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_od_IDX_1 | NONCLUSTERED | oui | societe, date_comptable, service, mop_od |

