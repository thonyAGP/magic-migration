# cafil093_dat

| Info | Valeur |
|------|--------|
| Lignes | 164 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_erreur` | nvarchar | 4 | non |  | 164 |
| 2 | `code_langue` | nvarchar | 1 | non |  | 1 |
| 3 | `page_manuel` | int | 10 | non |  | 1 |
| 4 | `libelle_erreur` | nvarchar | 40 | non |  | 131 |

## Valeurs distinctes

### `code_langue` (1 valeurs)

```
F
```

### `page_manuel` (1 valeurs)

```
999
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil093_dat_IDX_1 | NONCLUSTERED | oui | code_erreur, code_langue |

