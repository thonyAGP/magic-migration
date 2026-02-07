# cafil052_dat

| Info | Valeur |
|------|--------|
| Lignes | 157 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `com_code_action` | nvarchar | 1 | non |  | 1 |
| 2 | `com_code_operation` | nvarchar | 1 | non |  | 1 |
| 3 | `com_nom_ascii` | nvarchar | 12 | non |  | 157 |
| 4 | `com_date` | char | 8 | non |  | 101 |
| 5 | `com_heure` | char | 6 | non |  | 156 |
| 6 | `RowId_74` | int | 10 | non |  | 157 |

## Valeurs distinctes

### `com_code_action` (1 valeurs)

```
0
```

### `com_code_operation` (1 valeurs)

```
4
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil052_dat_IDX_1 | NONCLUSTERED | non | com_code_action |
| cafil052_dat_IDX_2 | NONCLUSTERED | oui | RowId_74 |

