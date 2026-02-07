# modele_etiquette

| Info | Valeur |
|------|--------|
| Lignes | 11 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono_ligne` | int | 10 | non |  | 11 |
| 2 | `etiqcolonne1` | int | 10 | non |  | 11 |
| 3 | `etiqcolonne2` | int | 10 | non |  | 11 |
| 4 | `etiqcolonne3` | int | 10 | non |  | 11 |
| 5 | `etiqcolonne4` | int | 10 | non |  | 11 |
| 6 | `pointage1` | bit |  | non |  | 1 |
| 7 | `pointage2` | bit |  | non |  | 1 |
| 8 | `pointage3` | bit |  | non |  | 1 |
| 9 | `pointage4` | bit |  | non |  | 1 |

## Valeurs distinctes

### `chrono_ligne` (11 valeurs)

```
1, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9
```

### `etiqcolonne1` (11 valeurs)

```
1, 13, 17, 21, 25, 29, 33, 37, 41, 5, 9
```

### `etiqcolonne2` (11 valeurs)

```
10, 14, 18, 2, 22, 26, 30, 34, 38, 42, 6
```

### `etiqcolonne3` (11 valeurs)

```
11, 15, 19, 23, 27, 3, 31, 35, 39, 43, 7
```

### `etiqcolonne4` (11 valeurs)

```
12, 16, 20, 24, 28, 32, 36, 4, 40, 44, 8
```

### `pointage1` (1 valeurs)

```
1
```

### `pointage2` (1 valeurs)

```
1
```

### `pointage3` (1 valeurs)

```
1
```

### `pointage4` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| modele_etiquette_IDX_1 | NONCLUSTERED | oui | chrono_ligne |

