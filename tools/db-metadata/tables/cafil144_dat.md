# cafil144_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cob_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `cob_qualite` | nvarchar | 2 | non |  | 2 |
| 3 | `cob_coefficient_tel` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `cob_societe` (2 valeurs)

```
C, G
```

### `cob_qualite` (2 valeurs)

```
GM, GO
```

### `cob_coefficient_tel` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil144_dat_IDX_1 | NONCLUSTERED | oui | cob_societe, cob_qualite |

