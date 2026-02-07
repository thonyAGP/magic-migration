# excupla_dat

| Info | Valeur |
|------|--------|
| Lignes | 22916 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `epl_type` | nvarchar | 1 | non |  | 1 |
| 2 | `epl_code` | int | 10 | non |  | 22 |
| 3 | `epl_date` | char | 8 | non |  | 1461 |
| 4 | `epl_date_cloture_i` | char | 8 | non |  | 1461 |
| 5 | `epl_time_cloture_i` | char | 6 | non |  | 3 |
| 6 | `epl_capacite_mini` | int | 10 | non |  | 8 |
| 7 | `epl_capacite_maxi_v` | int | 10 | non |  | 21 |
| 8 | `epl_nombre_vehicules` | int | 10 | non |  | 12 |
| 9 | `epl_places_vendues` | int | 10 | non |  | 65 |
| 10 | `epl_places_dispos` | int | 10 | non |  | 277 |
| 11 | `epl_mini_club_go_prv` | int | 10 | non |  | 1 |
| 12 | `epl_langues_demande` | nvarchar | 40 | non |  | 7 |

## Valeurs distinctes

### `epl_type` (1 valeurs)

```
1
```

### `epl_code` (22 valeurs)

```
1, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 26, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37
```

### `epl_time_cloture_i` (3 valeurs)

```
000000, 120000, 230000
```

### `epl_capacite_mini` (8 valeurs)

```
0, 1, 10, 2, 300, 5, 6, 8
```

### `epl_capacite_maxi_v` (21 valeurs)

```
0, 10, 100, 12, 14, 140, 15, 20, 200, 25, 30, 300, 35, 40, 5, 50, 500, 60, 70, 8, 80
```

### `epl_nombre_vehicules` (12 valeurs)

```
0, 1, 10, 2, 20, 3, 30, 4, 5, 50, 6, 7
```

### `epl_mini_club_go_prv` (1 valeurs)

```
0
```

### `epl_langues_demande` (7 valeurs)

```
, 
, 

, 


, 



, 




, 






```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excupla_dat_IDX_2 | NONCLUSTERED | oui | epl_date, epl_type, epl_code |
| excupla_dat_IDX_1 | NONCLUSTERED | oui | epl_type, epl_code, epl_date |

