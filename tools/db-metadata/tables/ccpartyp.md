# ccpartyp

| Info | Valeur |
|------|--------|
| Lignes | 1806 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_8chiffres` | int | 10 | non |  | 1444 |
| 3 | `filiation` | int | 10 | non |  | 11 |
| 4 | `type` | nvarchar | 2 | non |  | 3 |
| 5 | `solde_credit_conso` | float | 53 | non |  | 58 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type` (3 valeurs)

```
05, 30, 99
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ccpartyp_IDX_1 | NONCLUSTERED | oui | societe, code_8chiffres, filiation, type |

