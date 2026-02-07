# pv_equip_models_dat

| Info | Valeur |
|------|--------|
| Lignes | 49 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `manufacturer_id` | int | 10 | non |  | 7 |
| 2 | `model_id` | int | 10 | non |  | 48 |
| 3 | `model_name` | nvarchar | 20 | non |  | 49 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `manufacturer_id` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `model_id` (48 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 45, 46, 47, 48, 5, 6, 7, 8, 9
```

### `model_name` (49 valeurs)

```
9S, 9X, Accelerator IRT, Actys 100, Adultes Beige, Adultes Black, Adultes Bleu, Adultes CFT, Adultes Kaki, Attraxion, B +, B2 Woman, B3, Comp 9J GT, Comp 9J PT, Comp J2, Comp J3, Comp J4, Contact, Enfants KDS, Genesis, M 11, Micro Board, Mini 15, Minimax, Open 100, Open RTL, Performa 660, Performa T2, Performa T3, Power 8, Power 9.3, Power Black Gold, R18, Raquette Femme, Raquette Homme, Scratch freezb, Scratch FS, Skating, Sugar, Super J Gold enfants, Super J Red enfants, SuperJ Silver enfant, Symbio, T Power Red, T Power Silver, Traditionnel, Vertex, Z5
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_equip_models_dat_IDX_1 | NONCLUSTERED | oui | pv_service, manufacturer_id, model_id |

