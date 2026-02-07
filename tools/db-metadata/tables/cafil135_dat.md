# cafil135_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `coe_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `coe_qualite` | nvarchar | 2 | non |  | 2 |
| 3 | `coe_coefficient_tel` | float | 53 | non |  | 2 |

## Valeurs distinctes

### `coe_societe` (2 valeurs)

```
C, G
```

### `coe_qualite` (2 valeurs)

```
GM, GO
```

### `coe_coefficient_tel` (2 valeurs)

```
1, 3
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil135_dat_IDX_1 | NONCLUSTERED | oui | coe_societe, coe_qualite |

