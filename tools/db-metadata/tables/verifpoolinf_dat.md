# verifpoolinf_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `con_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `con_type` | int | 10 | non |  | 2 |
| 3 | `con_term` | int | 10 | non |  | 1 |
| 4 | `con_date_t_1` | char | 8 | non |  | 2 |
| 5 | `con_heure_t_1` | char | 6 | non |  | 2 |
| 6 | `con_date` | char | 8 | non |  | 1 |
| 7 | `con_heure` | char | 6 | non |  | 2 |
| 8 | `con_hostname` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `con_societe` (1 valeurs)

```
C
```

### `con_type` (2 valeurs)

```
1, 99
```

### `con_term` (1 valeurs)

```
0
```

### `con_date_t_1` (2 valeurs)

```
00000000, 20241113
```

### `con_heure_t_1` (2 valeurs)

```
000000, 012020
```

### `con_date` (1 valeurs)

```
20241113
```

### `con_heure` (2 valeurs)

```
013012, 014007
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| verifpoolinf_dat_IDX_1 | NONCLUSTERED | oui | con_societe, con_type, con_term, con_hostname |

