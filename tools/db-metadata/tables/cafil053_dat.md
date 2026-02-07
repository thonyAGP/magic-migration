# cafil053_dat

| Info | Valeur |
|------|--------|
| Lignes | 540 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cot_code_action` | nvarchar | 1 | non |  | 1 |
| 2 | `cot_code_operation` | nvarchar | 1 | non |  | 1 |
| 3 | `cot_nom_ascii` | nvarchar | 12 | non |  | 540 |
| 4 | `cot_date` | char | 8 | non |  | 203 |
| 5 | `cot_heure` | char | 6 | non |  | 526 |
| 6 | `cot_commande_triplet` | varchar | 120 | non |  | 9 |
| 7 | `RowId_75` | int | 10 | non |  | 540 |

## Valeurs distinctes

### `cot_code_action` (1 valeurs)

```
0
```

### `cot_code_operation` (1 valeurs)

```
2
```

### `cot_commande_triplet` (9 valeurs)

```
                  -,  11436 41000  7113-,  11436 41000  7113+MLACHTER             Sliman    2N,  11436 41001  4286-,  11436 41001  4286+MLACHTER             Sliman    2N,  21273 41000  5389-,  21273 41000  5389+FABBAS               Nur Azizah1N,  22236 41001  5926-,  22236 41001  5926+MMETHVEN             Donald Ben1N
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil053_dat_IDX_2 | NONCLUSTERED | oui | RowId_75 |
| cafil053_dat_IDX_1 | NONCLUSTERED | non | cot_code_action, cot_date, cot_heure |

