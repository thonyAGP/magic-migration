# cctotal

| Info | Valeur |
|------|--------|
| Lignes | 1314 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_8chiffres` | int | 10 | non |  | 1000 |
| 3 | `filiation` | int | 10 | non |  | 11 |
| 4 | `solde_credit_conso` | float | 53 | non |  | 74 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cctotal_IDX_1 | NONCLUSTERED | oui | societe, code_8chiffres, filiation |

