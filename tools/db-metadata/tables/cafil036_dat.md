# cafil036_dat

| Info | Valeur |
|------|--------|
| Lignes | 55 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sdk_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sdk_date_comptable` | char | 8 | non |  | 43 |
| 3 | `sdk_date_de_sortie` | char | 8 | non |  | 43 |
| 4 | `sdk_heure_de_sortie` | char | 6 | non |  | 55 |
| 5 | `sdk_nbre_de_lignes` | int | 10 | non |  | 8 |
| 6 | `sdk_top_validation` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `sdk_societe` (1 valeurs)

```
C
```

### `sdk_date_comptable` (43 valeurs)

```
20220407, 20220512, 20220601, 20220707, 20220711, 20220804, 20220830, 20220909, 20220930, 20221110, 20221116, 20221122, 20221129, 20221214, 20221231, 20230115, 20230128, 20230131, 20230214, 20230223, 20230228, 20230308, 20230330, 20230412, 20230425, 20230510, 20230523, 20230531, 20230613, 20230619, 20230705, 20230727, 20240113, 20240212, 20240305, 20240310, 20240324, 20240401, 20240515, 20240611, 20240701, 20240713, 20241031
```

### `sdk_date_de_sortie` (43 valeurs)

```
20220407, 20220512, 20220601, 20220707, 20220711, 20220804, 20220830, 20220909, 20220930, 20221110, 20221116, 20221122, 20221129, 20221214, 20221231, 20230115, 20230128, 20230131, 20230214, 20230223, 20230228, 20230308, 20230330, 20230412, 20230425, 20230510, 20230523, 20230531, 20230613, 20230619, 20230705, 20230727, 20240113, 20240212, 20240305, 20240310, 20240324, 20240401, 20240515, 20240611, 20240701, 20240713, 20241031
```

### `sdk_nbre_de_lignes` (8 valeurs)

```
1, 2, 4, 5, 6, 7, 8, 9
```

### `sdk_top_validation` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil036_dat_IDX_2 | NONCLUSTERED | oui | sdk_societe, sdk_date_comptable, sdk_date_de_sortie, sdk_heure_de_sortie |
| cafil036_dat_IDX_1 | NONCLUSTERED | oui | sdk_societe, sdk_date_comptable, sdk_date_de_sortie, sdk_heure_de_sortie |

