# cafil007_dat

| Info | Valeur |
|------|--------|
| Lignes | 6636 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `voy_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `voy_compte` | int | 10 | non |  | 1171 |
| 3 | `voy_filiation` | int | 10 | non |  | 13 |
| 4 | `voy_qualite` | nvarchar | 2 | non |  | 2 |
| 5 | `voy_code_a_d_r` | nvarchar | 1 | non |  | 2 |
| 6 | `voy_code_vol` | nvarchar | 6 | non |  | 173 |
| 7 | `voy_categorie_prix` | nvarchar | 6 | non |  | 10 |
| 8 | `voy_transport` | nvarchar | 2 | non |  | 9 |
| 9 | `voy_date_aeroport` | char | 8 | non |  | 201 |
| 10 | `voy_heure_aeroport` | char | 6 | non |  | 167 |
| 11 | `RowId_29` | int | 10 | non |  | 6636 |

## Valeurs distinctes

### `voy_societe` (1 valeurs)

```
C
```

### `voy_filiation` (13 valeurs)

```
0, 1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `voy_qualite` (2 valeurs)

```
GM, GO
```

### `voy_code_a_d_r` (2 valeurs)

```
A, R
```

### `voy_categorie_prix` (10 valeurs)

```
, CTBUS, CTCAR, CTECO, CTFIR, CTNDC, CTPRE, CTWE+, CTWEB, RQST
```

### `voy_transport` (9 valeurs)

```
, CF, CM, DR, ND, NF, RF, TO, WT
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil007_dat_IDX_1 | NONCLUSTERED | non | voy_societe, voy_compte, voy_filiation, voy_code_a_d_r |
| cafil007_dat_IDX_3 | NONCLUSTERED | oui | RowId_29 |
| cafil007_dat_IDX_2 | NONCLUSTERED | non | voy_societe, voy_code_a_d_r, voy_date_aeroport, voy_code_vol |

