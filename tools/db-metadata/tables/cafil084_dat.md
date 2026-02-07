# cafil084_dat

| Info | Valeur |
|------|--------|
| Lignes | 16 |
| Colonnes | 23 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom_standard` | nvarchar | 6 | non |  | 16 |
| 3 | `nom_complet` | nvarchar | 15 | non |  | 16 |
| 4 | `type_de_logement` | nvarchar | 2 | non |  | 3 |
| 5 | `ensemble` | nvarchar | 3 | non |  | 3 |
| 6 | `batiment` | nvarchar | 2 | non |  | 1 |
| 7 | `etage` | nvarchar | 2 | non |  | 1 |
| 8 | `vue` | nvarchar | 2 | non |  | 2 |
| 9 | `occupation` | int | 10 | non |  | 3 |
| 10 | `standing` | nvarchar | 2 | non |  | 1 |
| 11 | `lit_pliant` | nvarchar | 1 | non |  | 1 |
| 12 | `lit_bebe` | nvarchar | 1 | non |  | 1 |
| 13 | `lit_banquette` | nvarchar | 1 | non |  | 1 |
| 14 | `handicapes` | nvarchar | 1 | non |  | 1 |
| 15 | `communicante` | nvarchar | 1 | non |  | 1 |
| 16 | `numposte` | nvarchar | 6 | non |  | 1 |
| 17 | `nom_responsable` | nvarchar | 15 | non |  | 1 |
| 18 | `emplacement` | nvarchar | 30 | non |  | 1 |
| 19 | `adresse_1` | nvarchar | 30 | non |  | 1 |
| 20 | `adresse_2` | nvarchar | 30 | non |  | 1 |
| 21 | `adresse_3` | nvarchar | 30 | non |  | 1 |
| 22 | `code_menage` | char | 8 | non |  | 1 |
| 23 | `menage_verifie` | bit |  | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `nom_standard` (16 valeurs)

```
APT EX, BAMBOO, DOME 1, DOME 2, DOME 3, DOME 4, DOME 5, DOME 6, DOME 7, GE DOR, HOME, OUT1, OUT2, OUT3, OUT4, OUT5
```

### `nom_complet` (16 valeurs)

```
APT EXT, BAMBOO, DOME 1, DOME 2, DOME 3, DOME 4, DOME 5, DOME 6, DOME 7, GE DOR, HOME, OUTSIDE1, OUTSIDE2, OUTSIDE3, OUTSIDE4, OUTSIDE5
```

### `type_de_logement` (3 valeurs)

```
CR, RM, SR
```

### `ensemble` (3 valeurs)

```
KGS, KNG, TWN
```

### `batiment` (1 valeurs)

```
X
```

### `etage` (1 valeurs)

```
0
```

### `vue` (2 valeurs)

```
GV, SD
```

### `occupation` (3 valeurs)

```
1, 2, 7
```

### `standing` (1 valeurs)

```
1*
```

### `lit_pliant` (1 valeurs)

```
N
```

### `lit_bebe` (1 valeurs)

```
N
```

### `lit_banquette` (1 valeurs)

```
N
```

### `handicapes` (1 valeurs)

```
N
```

### `code_menage` (1 valeurs)

```
00000000
```

### `menage_verifie` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil084_dat_IDX_1 | NONCLUSTERED | oui | societe, nom_standard |

