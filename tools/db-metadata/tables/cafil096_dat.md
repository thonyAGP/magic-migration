# cafil096_dat

| Info | Valeur |
|------|--------|
| Lignes | 15 |
| Colonnes | 26 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero_d_ordre` | nvarchar | 1 | non |  | 15 |
| 3 | `nom_import` | nvarchar | 20 | non |  | 2 |
| 4 | `code_lieu_de_sejour` | nvarchar | 1 | non |  | 2 |
| 5 | `chemin_global` | nvarchar | 20 | non |  | 2 |
| 6 | `identite` | nvarchar | 12 | non |  | 2 |
| 7 | `fractionnement` | nvarchar | 12 | non |  | 2 |
| 8 | `passeport` | nvarchar | 12 | non |  | 2 |
| 9 | `complement` | nvarchar | 12 | non |  | 2 |
| 10 | `export` | nvarchar | 12 | non |  | 2 |
| 11 | `budget_jhp` | float | 53 | non |  | 1 |
| 12 | `budget_jhvrl` | float | 53 | non |  | 1 |
| 13 | `budget_jhd` | float | 53 | non |  | 1 |
| 14 | `nb_lit_comm` | int | 10 | non |  | 1 |
| 15 | `budget_gm_arrive` | float | 53 | non |  | 1 |
| 16 | `budget_gm_vv_transporte_package` | float | 53 | non |  | 1 |
| 17 | `budget_gm_vv` | float | 53 | non |  | 1 |
| 18 | `budget_gm_vv_transfere_AHP` | float | 53 | non |  | 1 |
| 19 | `budget_gm_vv_transfere_RHP` | float | 53 | non |  | 1 |
| 20 | `budget_gm_vv_transfere_ASP` | float | 53 | non |  | 1 |
| 21 | `budget_gm_vv_transfere_RSP` | float | 53 | non |  | 1 |
| 22 | `budget_jhp_s2` | float | 53 | non |  | 1 |
| 23 | `budget_jhvrl_s2` | float | 53 | non |  | 1 |
| 24 | `budget_jhd_s2` | float | 53 | non |  | 1 |
| 25 | `budget_jhvsl` | float | 53 | non |  | 1 |
| 26 | `budget_jhvsl_s2` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `numero_d_ordre` (15 valeurs)

```
A, B, C, D, E, F, G, H, I, J, K, L, M, N, O
```

### `nom_import` (2 valeurs)

```
Phuket, Sans Objet
```

### `code_lieu_de_sejour` (2 valeurs)

```
G, N
```

### `chemin_global` (2 valeurs)

```
, M:\pms\datavar\arr\
```

### `identite` (2 valeurs)

```
, IDE.DAT
```

### `fractionnement` (2 valeurs)

```
, FRA.DAT
```

### `passeport` (2 valeurs)

```
, ANN.DAT
```

### `complement` (2 valeurs)

```
, MOD.DAT
```

### `export` (2 valeurs)

```
, PHUC
```

### `budget_jhp` (1 valeurs)

```
0
```

### `budget_jhvrl` (1 valeurs)

```
0
```

### `budget_jhd` (1 valeurs)

```
0
```

### `nb_lit_comm` (1 valeurs)

```
0
```

### `budget_gm_arrive` (1 valeurs)

```
0
```

### `budget_gm_vv_transporte_package` (1 valeurs)

```
0
```

### `budget_gm_vv` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_AHP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_RHP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_ASP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_RSP` (1 valeurs)

```
0
```

### `budget_jhp_s2` (1 valeurs)

```
0
```

### `budget_jhvrl_s2` (1 valeurs)

```
0
```

### `budget_jhd_s2` (1 valeurs)

```
0
```

### `budget_jhvsl` (1 valeurs)

```
0
```

### `budget_jhvsl_s2` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil096_dat_IDX_1 | NONCLUSTERED | oui | code_societe, numero_d_ordre |
| cafil096_dat_IDX_2 | NONCLUSTERED | oui | code_societe, code_lieu_de_sejour, nom_import, numero_d_ordre |

