# cafil056_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tel_cle` | nvarchar | 1 | non |  | 1 |
| 2 | `tel_telephone_cam` | nvarchar | 1 | non |  | 1 |
| 3 | `tel_retour_taxe` | nvarchar | 1 | non |  | 1 |
| 4 | `tel_interface` | nvarchar | 5 | non |  | 1 |
| 5 | `tel_langue__` | nvarchar | 1 | non |  | 1 |
| 6 | `tel_longueur_code` | int | 10 | non |  | 1 |
| 7 | `tel_nb_codes_accepte` | int | 10 | non |  | 1 |
| 8 | `tel_borne_min` | int | 10 | non |  | 1 |
| 9 | `tel_borne_max` | int | 10 | non |  | 1 |
| 10 | `tel_type_triplet` | nvarchar | 1 | non |  | 1 |
| 11 | `tel_ligne_min` | int | 10 | non |  | 1 |
| 12 | `tel_ligne_max` | int | 10 | non |  | 1 |
| 13 | `tel_s_d_a_` | nvarchar | 1 | non |  | 1 |
| 14 | `tel_max_ligne_poste` | int | 10 | non |  | 1 |
| 15 | `tel_longueur_poste` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `tel_cle` (1 valeurs)

```
0
```

### `tel_telephone_cam` (1 valeurs)

```
N
```

### `tel_retour_taxe` (1 valeurs)

```
N
```

### `tel_interface` (1 valeurs)

```
FCS
```

### `tel_langue__` (1 valeurs)

```
N
```

### `tel_longueur_code` (1 valeurs)

```
4
```

### `tel_nb_codes_accepte` (1 valeurs)

```
3000
```

### `tel_borne_min` (1 valeurs)

```
1000
```

### `tel_borne_max` (1 valeurs)

```
9999
```

### `tel_type_triplet` (1 valeurs)

```
1
```

### `tel_ligne_min` (1 valeurs)

```
41000
```

### `tel_ligne_max` (1 valeurs)

```
41999
```

### `tel_s_d_a_` (1 valeurs)

```
N
```

### `tel_max_ligne_poste` (1 valeurs)

```
4
```

### `tel_longueur_poste` (1 valeurs)

```
5
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil056_dat_IDX_1 | NONCLUSTERED | oui | tel_cle |

