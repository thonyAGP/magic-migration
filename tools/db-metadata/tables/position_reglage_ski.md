# position_reglage_ski

**Nom logique Magic** : `position_reglage_ski`

| Info | Valeur |
|------|--------|
| Lignes | 256 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `prs_sexe` | nvarchar | 1 | non |  | 2 |
| 2 | `prs_chrono_ligne` | int | 10 | non |  | 16 |
| 3 | `prs_poids_debut` | smallint | 5 | non |  | 14 |
| 4 | `prs_poids_fin` | smallint | 5 | non |  | 13 |
| 5 | `prs_pointure_debut` | smallint | 5 | non |  | 8 |
| 6 | `prs_pointure_fin` | smallint | 5 | non |  | 8 |
| 7 | `prs_position` | nvarchar | 6 | non |  | 28 |
| 8 | `prs_taille_debut` | int | 10 | non |  | 7 |
| 9 | `prs_taille_fin` | int | 10 | non |  | 7 |
| 10 | `prs_position_num` | float | 53 | non |  | 28 |

## Valeurs distinctes

### `prs_sexe` (2 valeurs)

```
F, H
```

### `prs_chrono_ligne` (16 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 2, 3, 4, 5, 6, 7, 8, 9
```

### `prs_poids_debut` (14 valeurs)

```
10, 14, 18, 22, 26, 31, 36, 42, 49, 58, 67, 79, 95, 999
```

### `prs_poids_fin` (13 valeurs)

```
13, 17, 21, 25, 30, 35, 41, 48, 57, 66, 78, 94, 999
```

### `prs_pointure_debut` (8 valeurs)

```
0, 231, 251, 271, 291, 311, 331, 351
```

### `prs_pointure_fin` (8 valeurs)

```
230, 250, 270, 290, 310, 330, 350, 999
```

### `prs_position` (28 valeurs)

```
1, 1 1/2, 1 1/4, 1 3/4, 10, 10 1/2, 11, 11 1/2, 12, 2, 2 1/2, 2 1/4, 2 3/4, 3, 3 1/2, 3/4, 4, 4 1/2, 5, 5 1/2, 6, 6 1/2, 7, 7 1/2, 8, 8 1/2, 9, 9 1/2
```

### `prs_taille_debut` (7 valeurs)

```
0, 149, 158, 167, 179, 195, 999
```

### `prs_taille_fin` (7 valeurs)

```
0, 148, 157, 166, 178, 194, 999
```

### `prs_position_num` (28 valeurs)

```
0.75, 1, 1.25, 1.5, 1.75, 10, 10.5, 11, 11.5, 12, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| position_reglage_ski_IDX_1 | NONCLUSTERED | oui | prs_sexe, prs_chrono_ligne, prs_poids_debut, prs_poids_fin, prs_pointure_debut, prs_pointure_fin |

