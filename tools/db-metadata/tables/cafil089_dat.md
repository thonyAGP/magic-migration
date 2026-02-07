# cafil089_dat

| Info | Valeur |
|------|--------|
| Lignes | 136 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_historique` | nvarchar | 4 | non |  | 136 |
| 2 | `code_langue` | nvarchar | 1 | non |  | 1 |
| 3 | `libelle_historique` | nvarchar | 30 | non |  | 129 |

## Valeurs distinctes

### `code_langue` (1 valeurs)

```
F
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil089_dat_IDX_1 | NONCLUSTERED | oui | code_historique, code_langue |

