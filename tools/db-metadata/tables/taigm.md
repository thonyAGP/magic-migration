# taigm

| Info | Valeur |
|------|--------|
| Lignes | 14134 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tai_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tai_compte` | int | 10 | non |  | 5087 |
| 3 | `tai_filiation` | int | 10 | non |  | 19 |
| 4 | `tai_date_debut` | char | 8 | non |  | 321 |
| 5 | `tai_date_fin` | char | 8 | non |  | 329 |
| 6 | `tai_code_forfait` | nvarchar | 6 | non |  | 1 |
| 7 | `tai_origine` | nvarchar | 5 | non |  | 1 |
| 8 | `tai_modifiable` | nvarchar | 1 | non |  | 1 |
| 9 | `tai_montant` | float | 53 | non |  | 1 |
| 10 | `tai_date_comptable` | char | 8 | non |  | 1 |
| 11 | `tai_date_operation` | char | 8 | non |  | 319 |
| 12 | `tai_heure_operation` | char | 6 | non |  | 1521 |
| 13 | `tai_user` | nvarchar | 10 | non |  | 5 |
| 14 | `tai_code_article` | int | 10 | non |  | 1 |
| 15 | `tai_reglement_cash` | bit |  | non |  | 1 |
| 16 | `tai_quantite` | int | 10 | non |  | 1 |
| 17 | `tai_libelle_article` | nvarchar | 30 | non |  | 1 |
| 18 | `tai_site_creation` | nvarchar | 5 | non |  | 1 |

## Valeurs distinctes

### `tai_societe` (1 valeurs)

```
C
```

### `tai_filiation` (19 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `tai_code_forfait` (1 valeurs)

```
PHUSAI
```

### `tai_origine` (1 valeurs)

```
NA
```

### `tai_modifiable` (1 valeurs)

```
N
```

### `tai_montant` (1 valeurs)

```
0
```

### `tai_date_comptable` (1 valeurs)

```
00000000
```

### `tai_user` (5 valeurs)

```
ASIAMIS, LYS, PLANNING, SNOW, WELCMGR
```

### `tai_code_article` (1 valeurs)

```
0
```

### `tai_reglement_cash` (1 valeurs)

```
0
```

### `tai_quantite` (1 valeurs)

```
1
```

### `tai_libelle_article` (1 valeurs)

```
FORFAIRT SAI NA
```

### `tai_site_creation` (1 valeurs)

```
NA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taigm_IDX_1 | NONCLUSTERED | oui | tai_societe, tai_compte, tai_filiation, tai_date_debut, tai_date_fin |
| taigm_IDX_2 | NONCLUSTERED | non | tai_origine, tai_user, tai_date_comptable |

