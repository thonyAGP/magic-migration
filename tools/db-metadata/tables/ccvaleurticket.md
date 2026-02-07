# ccvaleurticket

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `couleur` | nvarchar | 20 | non |  | 5 |
| 2 | `valeur` | float | 53 | non |  | 5 |

## Valeurs distinctes

### `couleur` (5 valeurs)

```
Blue, Green, Hmoon Asia, Red, Yellow
```

### `valeur` (5 valeurs)

```
16, 32, 320, 64, 8
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ccvaleurticket_IDX_1 | NONCLUSTERED | oui | valeur |

