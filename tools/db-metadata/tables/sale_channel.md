# sale_channel

**Nom logique Magic** : `sale_channel`

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sch_type` | nvarchar | 3 | non |  | 1 |
| 2 | `sch_agent` | nvarchar | 9 | non |  | 3 |

## Valeurs distinctes

### `sch_type` (1 valeurs)

```
IND
```

### `sch_agent` (3 valeurs)

```
AZW08, RETAIL, WEB08
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| sale_channel_IDX_1 | NONCLUSTERED | oui | sch_type, sch_agent |

