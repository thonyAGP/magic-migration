# cafil148_dat

| Info | Valeur |
|------|--------|
| Lignes | 554 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `anu_type_client` | nvarchar | 1 | non |  | 2 |
| 2 | `anu_num_adherent` | float | 53 | non |  | 189 |
| 3 | `anu_filiation_club` | int | 10 | non |  | 21 |
| 4 | `anu_num_dossier` | int | 10 | non |  | 195 |
| 5 | `anu_num_ordre` | int | 10 | non |  | 17 |
| 6 | `anu_debut_sejour` | char | 8 | non |  | 93 |

## Valeurs distinctes

### `anu_type_client` (2 valeurs)

```
B, C
```

### `anu_filiation_club` (21 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 2, 3, 4, 48, 49, 5, 50, 51, 53, 54, 6, 7, 8, 9
```

### `anu_num_ordre` (17 valeurs)

```
1, 10, 11, 12, 13, 14, 2, 23, 3, 39, 4, 40, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil148_dat_IDX_2 | NONCLUSTERED | oui | anu_type_client, anu_num_adherent, anu_filiation_club, anu_num_dossier, anu_num_ordre |
| cafil148_dat_IDX_1 | NONCLUSTERED | non | anu_num_dossier, anu_num_ordre |
| cafil148_dat_IDX_3 | NONCLUSTERED | non | anu_debut_sejour |

