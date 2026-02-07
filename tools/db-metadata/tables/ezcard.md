# ezcard

| Info | Valeur |
|------|--------|
| Lignes | 6769 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_gm` | int | 10 | non |  | 2647 |
| 3 | `filiation` | int | 10 | non |  | 18 |
| 4 | `card_code` | nvarchar | 10 | non |  | 6769 |
| 5 | `status` | nvarchar | 1 | non |  | 3 |
| 6 | `plafond` | float | 53 | non |  | 1 |
| 7 | `type` | nvarchar | 1 | non |  | 1 |
| 8 | `date_operation` | char | 8 | non |  | 96 |
| 9 | `ttime_operation` | char | 6 | non |  | 3367 |
| 10 | `utilisateur` | nvarchar | 10 | non |  | 18 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `status` (3 valeurs)

```
I, O, V
```

### `plafond` (1 valeurs)

```
0
```

### `utilisateur` (18 valeurs)

```
ARKON, BEAM, DOREEN, ESTELLE, EVE, FAM, GIFT, JAA, JENN, JOLIE, JULIA, MICKY, MIND, NANA, OAT, PAULINE, PLANNING, WELCMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ezcard_IDX_1 | NONCLUSTERED | oui | societe, code_gm, filiation, card_code |
| ezcard_IDX_2 | NONCLUSTERED | oui | card_code |

