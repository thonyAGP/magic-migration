# scelles_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sce_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sce_compte` | int | 10 | non |  | 1 |
| 3 | `sce_filiation` | int | 10 | non |  | 1 |
| 4 | `sce_scelle` | nvarchar | 12 | non |  | 1 |
| 5 | `sce_date_depot` | char | 8 | non |  | 2 |
| 6 | `sce_heure_depot` | char | 6 | non |  | 2 |
| 7 | `sce_date_retrait` | char | 8 | non |  | 1 |
| 8 | `sce_heure_retrait` | char | 6 | non |  | 2 |
| 9 | `sce_date_dern_op` | char | 8 | non |  | 1 |
| 10 | `sce_heure_dern_op` | char | 6 | non |  | 2 |
| 11 | `RowId_456` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `sce_societe` (1 valeurs)

```
C
```

### `sce_compte` (1 valeurs)

```
610332
```

### `sce_filiation` (1 valeurs)

```
0
```

### `sce_scelle` (1 valeurs)

```
BK864769
```

### `sce_date_depot` (2 valeurs)

```
20240512, 20240513
```

### `sce_heure_depot` (2 valeurs)

```
095202, 142148
```

### `sce_date_retrait` (1 valeurs)

```
20240513
```

### `sce_heure_retrait` (2 valeurs)

```
142130, 142158
```

### `sce_date_dern_op` (1 valeurs)

```
20240513
```

### `sce_heure_dern_op` (2 valeurs)

```
142130, 142158
```

### `RowId_456` (2 valeurs)

```
2, 3
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| scelles_dat_IDX_1 | NONCLUSTERED | non | sce_societe, sce_compte, sce_filiation, sce_date_dern_op, sce_heure_dern_op |
| scelles_dat_IDX_2 | NONCLUSTERED | oui | RowId_456 |

