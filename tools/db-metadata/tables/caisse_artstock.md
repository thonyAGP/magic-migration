# caisse_artstock

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_article` | int | 10 | non |  | 4 |
| 2 | `est_gere_en_stock` | bit |  | non |  | 1 |

## Valeurs distinctes

### `code_article` (4 valeurs)

```
553, 554, 555, 557
```

### `est_gere_en_stock` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_artstock_IDX_1 | NONCLUSTERED | oui | code_article |

