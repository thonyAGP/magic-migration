# taistart

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `indicateur` | nvarchar | 1 | non |  | 1 |
| 2 | `date_demarrage` | char | 8 | non |  | 1 |
| 3 | `libre` | nvarchar | 120 | non |  | 1 |

## Valeurs distinctes

### `indicateur` (1 valeurs)

```
O
```

### `date_demarrage` (1 valeurs)

```
20050502
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taistart_IDX_1 | NONCLUSTERED | oui | indicateur |

