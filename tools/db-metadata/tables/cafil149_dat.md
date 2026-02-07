# cafil149_dat

| Info | Valeur |
|------|--------|
| Lignes | 3739 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `com_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `com_num_compte` | int | 10 | non |  | 1117 |
| 3 | `com_filiation` | int | 10 | non |  | 15 |
| 4 | `com_type_commentaire` | int | 10 | non |  | 3 |
| 5 | `com_commentaire` | nvarchar | 60 | non |  | 915 |
| 6 | `com_lb_code` | nvarchar | 3 | non |  | 1 |
| 7 | `com_lb_type_produit` | nvarchar | 2 | non |  | 1 |
| 8 | `com_lb_code_produit` | nvarchar | 6 | non |  | 1 |
| 9 | `com_lb_date` | char | 8 | non |  | 1 |
| 10 | `RowId_171` | int | 10 | non |  | 3739 |

## Valeurs distinctes

### `com_societe` (1 valeurs)

```
C
```

### `com_filiation` (15 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `com_type_commentaire` (3 valeurs)

```
0, 3, 4
```

### `com_lb_date` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil149_dat_IDX_2 | NONCLUSTERED | oui | RowId_171 |
| cafil149_dat_IDX_1 | NONCLUSTERED | non | com_societe, com_num_compte, com_filiation, com_type_commentaire |

