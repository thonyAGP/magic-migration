# param_easy_arrival

**Nom logique Magic** : `param_easy_arrival`

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pea_type` | nvarchar | 10 | non |  | 3 |
| 2 | `pea_code_ea` | nvarchar | 1 | non |  | 3 |

## Valeurs distinctes

### `pea_type` (3 valeurs)

```
COURS, ENFANT, LOCATION
```

### `pea_code_ea` (3 valeurs)

```
C, E, L
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| param_easy_arrival_IDX_1 | NONCLUSTERED | oui | pea_type |

