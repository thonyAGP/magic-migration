# execran_par

| Info | Valeur |
|------|--------|
| Lignes | 205 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 4 | non |  | 3 |
| 2 | `numero_ecran` | int | 10 | non |  | 45 |
| 3 | `type_de_programme` | nvarchar | 5 | non |  | 4 |
| 4 | `type_ecran` | nvarchar | 6 | non |  | 86 |
| 5 | `titre` | nvarchar | 30 | non |  | 129 |

## Valeurs distinctes

### `code_langue` (3 valeurs)

```
ANG, FRA, LIST
```

### `numero_ecran` (45 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 5, 6, 7, 8, 9
```

### `type_de_programme` (4 valeurs)

```
, EA, EI, EM
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| execran_par_IDX_1 | NONCLUSTERED | oui | code_langue, numero_ecran, type_de_programme |

