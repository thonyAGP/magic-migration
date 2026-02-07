# pv_customer_dat

| Info | Valeur |
|------|--------|
| Lignes | 4484 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gm_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `gm_compte` | int | 10 | non |  | 1659 |
| 3 | `gm_filiation` | int | 10 | non |  | 18 |
| 4 | `xcust_id` | float | 53 | non |  | 4483 |
| 5 | `gm_nom` | nvarchar | 30 | non |  | 1945 |
| 6 | `gm_prenom` | nvarchar | 20 | non |  | 3641 |
| 7 | `gm_sexe` | nvarchar | 1 | non |  | 3 |
| 8 | `gm_poids` | nvarchar | 12 | non |  | 1 |
| 9 | `gm_taille` | nvarchar | 12 | non |  | 1 |
| 10 | `gm_age` | int | 10 | non |  | 87 |
| 11 | `gm_din_skier_code` | nvarchar | 2 | non |  | 1 |
| 12 | `skier_type` | nvarchar | 5 | non |  | 1 |
| 13 | `snowboarder_type` | nvarchar | 5 | non |  | 1 |
| 14 | `damage_protection` | bit |  | non |  | 1 |
| 15 | `deposit` | bit |  | non |  | 1 |
| 16 | `id_booker` | int | 10 | non |  | 1 |
| 17 | `gm_height` | int | 10 | non |  | 1 |
| 18 | `gm_weight` | int | 10 | non |  | 1 |
| 19 | `gm_shoe_size` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `gm_societe` (1 valeurs)

```
C
```

### `gm_filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gm_sexe` (3 valeurs)

```
, F, H
```

### `damage_protection` (1 valeurs)

```
0
```

### `deposit` (1 valeurs)

```
0
```

### `id_booker` (1 valeurs)

```
0
```

### `gm_height` (1 valeurs)

```
0
```

### `gm_weight` (1 valeurs)

```
0
```

### `gm_shoe_size` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_customer_dat_IDX_1 | NONCLUSTERED | oui | gm_societe, gm_compte, gm_filiation |
| pv_customer_dat_IDX_4 | NONCLUSTERED | non | gm_societe, gm_prenom, gm_nom |
| pv_customer_dat_IDX_2 | NONCLUSTERED | oui | xcust_id, gm_societe, gm_compte, gm_filiation |
| pv_customer_dat_IDX_3 | NONCLUSTERED | non | gm_societe, gm_nom, gm_prenom |

