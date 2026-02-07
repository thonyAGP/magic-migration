# caisse_vente_par_mop

| Info | Valeur |
|------|--------|
| Lignes | 20851 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1379 |
| 3 | `service` | nvarchar | 4 | non |  | 6 |
| 4 | `mop` | nvarchar | 4 | non |  | 7 |
| 5 | `montant_calcule` | float | 53 | non |  | 4050 |
| 6 | `montant_saisi` | float | 53 | non |  | 4050 |
| 7 | `ecart` | bit |  | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `service` (6 valeurs)

```
, BARD, BOUT, ESTH, EXCU, REST
```

### `mop` (7 valeurs)

```
ALIP, AMEX, CCAU, UNIO, VISA, WECH, ZZZ
```

### `ecart` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_vente_par_mop_IDX_1 | NONCLUSTERED | oui | societe, date_comptable, service, mop |

