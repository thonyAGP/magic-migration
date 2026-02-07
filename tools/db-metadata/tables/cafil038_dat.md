# cafil038_dat

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tca_type_action` | nvarchar | 1 | non |  | 5 |
| 2 | `tca_libelle` | nvarchar | 20 | non |  | 5 |
| 3 | `tca_code_acces` | nvarchar | 2 | non |  | 5 |
| 4 | `tca_modifiable__` | nvarchar | 1 | non |  | 1 |
| 5 | `RowId_60` | int | 10 | non |  | 5 |

## Valeurs distinctes

### `tca_type_action` (5 valeurs)

```
1, 2, 3, 4, 5
```

### `tca_libelle` (5 valeurs)

```
Appel AdhÃ©rent, Appel Service, Cabine, Femme de menage, Poste OpÃ©rateur
```

### `tca_code_acces` (5 valeurs)

```
0, 1, 2, 86, 9
```

### `tca_modifiable__` (1 valeurs)

```
N
```

### `RowId_60` (5 valeurs)

```
1, 2, 3, 4, 5
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil038_dat_IDX_3 | NONCLUSTERED | oui | RowId_60 |
| cafil038_dat_IDX_2 | NONCLUSTERED | non | tca_code_acces |
| cafil038_dat_IDX_1 | NONCLUSTERED | non | tca_type_action |

