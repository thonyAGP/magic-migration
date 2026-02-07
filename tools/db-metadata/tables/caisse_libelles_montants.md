# caisse_libelles_montants

| Info | Valeur |
|------|--------|
| Lignes | 99 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `langue` | nvarchar | 3 | non |  | 1 |
| 2 | `nombre` | int | 10 | non |  | 99 |
| 3 | `libelle` | nvarchar | 64 | non |  | 99 |

## Valeurs distinctes

### `langue` (1 valeurs)

```
FRA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_libelles_montants_IDX_1 | NONCLUSTERED | oui | langue, nombre |

