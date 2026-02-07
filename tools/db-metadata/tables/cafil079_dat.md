# cafil079_dat

| Info | Valeur |
|------|--------|
| Lignes | 26 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cla_code_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `cla_code_num_` | int | 10 | non |  | 6 |
| 3 | `cla_classe` | nvarchar | 6 | non |  | 6 |
| 4 | `cla_libelle` | nvarchar | 20 | non |  | 6 |
| 5 | `cla_code_modif_` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `cla_code_societe` (5 valeurs)

```
A, B, C, D, G
```

### `cla_code_num_` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `cla_classe` (6 valeurs)

```
$CARD, $CASH, $PAPER, CHGE, OD, PERS
```

### `cla_libelle` (6 valeurs)

```
Cartes de crÃ©dit, Change, EspÃ¨ces, Garantie personnelle, Monnaie papier, O.D.
```

### `cla_code_modif_` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil079_dat_IDX_1 | NONCLUSTERED | oui | cla_code_societe, cla_code_num_ |

