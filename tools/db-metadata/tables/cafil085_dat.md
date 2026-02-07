# cafil085_dat

| Info | Valeur |
|------|--------|
| Lignes | 214 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_langue` | nvarchar | 1 | non |  | 2 |
| 3 | `code_menage` | nvarchar | 1 | non |  | 2 |
| 4 | `code_tri` | nvarchar | 2 | non |  | 91 |
| 5 | `zone_secteur` | nvarchar | 10 | non |  | 198 |
| 6 | `nom_zone_secteur` | nvarchar | 20 | non |  | 53 |
| 7 | `responsable` | nvarchar | 15 | non |  | 2 |
| 8 | `adjoint` | nvarchar | 15 | non |  | 1 |
| 9 | `nb_logement` | int | 10 | non |  | 42 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code_langue` (2 valeurs)

```
F, G
```

### `code_menage` (2 valeurs)

```
S, Z
```

### `responsable` (2 valeurs)

```
, House Keeping
```

### `nb_logement` (42 valeurs)

```
0, 1, 10, -106, 11, -111, -118, 12, -12, -123, 13, 14, 15, 16, 18, 19, 2, 20, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 36, 38, 44, 45, 47, 48, 49, 54, 58, 6, 7, 93, 94
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil085_dat_IDX_1 | NONCLUSTERED | oui | societe, code_langue, code_menage, code_tri |
| cafil085_dat_IDX_2 | NONCLUSTERED | non | societe, code_menage, code_tri |

