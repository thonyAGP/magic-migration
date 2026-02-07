# synthese_saison_forfait_ski

**Nom logique Magic** : `synthese_saison_forfait_ski`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 21 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ssfs_code_saison` | nvarchar | 1 | non |  | 1 |
| 2 | `ssfs_type_enregistrement` | nvarchar | 1 | non |  | 2 |
| 3 | `ssfs_valeur_demi_journee` | int | 10 | non |  | 1 |
| 4 | `ssfs_valeur_1jour` | int | 10 | non |  | 1 |
| 5 | `ssfs_valeur_2jours` | int | 10 | non |  | 1 |
| 6 | `ssfs_valeur_3jours` | int | 10 | non |  | 2 |
| 7 | `ssfs_valeur_4jours` | int | 10 | non |  | 2 |
| 8 | `ssfs_valeur_5jours` | int | 10 | non |  | 2 |
| 9 | `ssfs_valeur_6jours` | int | 10 | non |  | 2 |
| 10 | `ssfs_valeur_7jours` | int | 10 | non |  | 2 |
| 11 | `ssfs_valeur_8jours` | int | 10 | non |  | 2 |
| 12 | `ssfs_valeur_9jours` | int | 10 | non |  | 2 |
| 13 | `ssfs_valeur_10jours` | int | 10 | non |  | 2 |
| 14 | `ssfs_valeur_11jours` | int | 10 | non |  | 2 |
| 15 | `ssfs_valeur_12jours` | int | 10 | non |  | 2 |
| 16 | `ssfs_valeur_13jours` | int | 10 | non |  | 2 |
| 17 | `ssfs_valeur_14jours` | int | 10 | non |  | 2 |
| 18 | `ssfs_valeur_15jours` | int | 10 | non |  | 2 |
| 19 | `ssfs_valeur_total` | int | 10 | non |  | 2 |
| 20 | `ssfs_jhp` | int | 10 | non |  | 2 |
| 21 | `ssfs_depassement` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `ssfs_code_saison` (1 valeurs)

```
H
```

### `ssfs_type_enregistrement` (2 valeurs)

```
F, J
```

### `ssfs_valeur_demi_journee` (1 valeurs)

```
0
```

### `ssfs_valeur_1jour` (1 valeurs)

```
0
```

### `ssfs_valeur_2jours` (1 valeurs)

```
0
```

### `ssfs_valeur_3jours` (2 valeurs)

```
1614, 538
```

### `ssfs_valeur_4jours` (2 valeurs)

```
2064, 8256
```

### `ssfs_valeur_5jours` (2 valeurs)

```
11630, 2326
```

### `ssfs_valeur_6jours` (2 valeurs)

```
1632, 9792
```

### `ssfs_valeur_7jours` (2 valeurs)

```
2303, 329
```

### `ssfs_valeur_8jours` (2 valeurs)

```
2392, 299
```

### `ssfs_valeur_9jours` (2 valeurs)

```
2133, 237
```

### `ssfs_valeur_10jours` (2 valeurs)

```
84, 840
```

### `ssfs_valeur_11jours` (2 valeurs)

```
70, 770
```

### `ssfs_valeur_12jours` (2 valeurs)

```
75, 900
```

### `ssfs_valeur_13jours` (2 valeurs)

```
1066, 82
```

### `ssfs_valeur_14jours` (2 valeurs)

```
126, 9
```

### `ssfs_valeur_15jours` (2 valeurs)

```
421, 6315
```

### `ssfs_valeur_total` (2 valeurs)

```
48137, 8166
```

### `ssfs_jhp` (2 valeurs)

```
0, 104977
```

### `ssfs_depassement` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| synthese_saison_forfait_sk_IDX1 | NONCLUSTERED | oui | ssfs_code_saison, ssfs_type_enregistrement |

