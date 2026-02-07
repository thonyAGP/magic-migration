# cafil008_dat

| Info | Valeur |
|------|--------|
| Lignes | 10225 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gmr_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `gmr_code_gm` | int | 10 | non |  | 3814 |
| 3 | `gmr_filiation_villag` | int | 10 | non |  | 18 |
| 4 | `gmr_acces` | nvarchar | 1 | non |  | 2 |
| 5 | `gmr_type_de_client` | nvarchar | 1 | non |  | 2 |
| 6 | `gmr_num__club` | float | 53 | non |  | 3902 |
| 7 | `gmr_lettre_controle` | nvarchar | 1 | non |  | 16 |
| 8 | `gmr_filiation_club` | int | 10 | non |  | 24 |
| 9 | `gmr_nom__30_` | nvarchar | 30 | non |  | 3791 |
| 10 | `gmr_prenom__8_` | nvarchar | 10 | non |  | 7128 |
| 11 | `gmr_sexe` | nvarchar | 1 | non |  | 3 |
| 12 | `gmr_age` | nvarchar | 1 | non |  | 99 |
| 13 | `gmr_langue_parlee` | nvarchar | 2 | non |  | 9 |
| 14 | `gmr_qualite` | nvarchar | 2 | non |  | 2 |
| 15 | `gmr_flag_num_terminal` | int | 10 | non |  | 1 |
| 16 | `gmr_gratuites__` | nvarchar | 1 | non |  | 2 |
| 17 | `gmr_debut_sejour` | char | 8 | non |  | 216 |
| 18 | `gmr_fin_sejour` | char | 8 | non |  | 153 |
| 19 | `gmr_age_num` | int | 10 | non |  | 89 |
| 20 | `gmr_age_nb_mois` | int | 10 | non |  | 12 |

## Valeurs distinctes

### `gmr_societe` (1 valeurs)

```
C
```

### `gmr_filiation_villag` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gmr_acces` (2 valeurs)

```
N, O
```

### `gmr_type_de_client` (2 valeurs)

```
B, C
```

### `gmr_lettre_controle` (16 valeurs)

```
, A, C, D, G, J, M, N, P, Q, R, S, T, U, Y, Z
```

### `gmr_filiation_club` (24 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 83, 9, 93
```

### `gmr_sexe` (3 valeurs)

```
, F, H
```

### `gmr_langue_parlee` (9 valeurs)

```
, 1, 2, 3, 4, 5, 6, 7, 9
```

### `gmr_qualite` (2 valeurs)

```
GM, GO
```

### `gmr_flag_num_terminal` (1 valeurs)

```
0
```

### `gmr_gratuites__` (2 valeurs)

```
N, O
```

### `gmr_age_nb_mois` (12 valeurs)

```
0, 1, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil008_dat_IDX_4 | NONCLUSTERED | non | gmr_flag_num_terminal |
| cafil008_dat_IDX_6 | NONCLUSTERED | non | gmr_nom__30_, gmr_prenom__8_ |
| cafil008_dat_IDX_3 | NONCLUSTERED | oui | gmr_societe, gmr_type_de_client, gmr_num__club, gmr_filiation_club |
| cafil008_dat_IDX_5 | NONCLUSTERED | non | gmr_acces, gmr_nom__30_, gmr_prenom__8_ |
| cafil008_dat_IDX_2 | NONCLUSTERED | non | gmr_societe, gmr_nom__30_, gmr_code_gm, gmr_filiation_villag |
| cafil008_dat_IDX_1 | NONCLUSTERED | oui | gmr_societe, gmr_code_gm, gmr_filiation_villag |

