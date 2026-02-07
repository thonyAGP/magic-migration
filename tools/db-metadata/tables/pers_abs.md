# pers_abs

| Info | Valeur |
|------|--------|
| Lignes | 850 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `compte` | int | 10 | non |  | 343 |
| 3 | `filiation` | int | 10 | non |  | 1 |
| 4 | `date_debut` | char | 8 | non |  | 538 |
| 5 | `date_fin` | char | 8 | non |  | 537 |
| 6 | `raison` | nvarchar | 2 | non |  | 6 |
| 7 | `date_creation` | char | 8 | non |  | 484 |
| 8 | `abs_repas_depart` | int | 10 | non |  | 3 |
| 9 | `abs_repas_retour` | int | 10 | non |  | 3 |
| 10 | `abs_id` | int | 10 | non |  | 850 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `filiation` (1 valeurs)

```
0
```

### `raison` (6 valeurs)

```
, 01, 02, 03, 04, 05
```

### `abs_repas_depart` (3 valeurs)

```
0, 1, 2
```

### `abs_repas_retour` (3 valeurs)

```
0, 1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pers_abs_IDX_1 | NONCLUSTERED | oui | code_societe, compte, filiation, date_debut |
| pers_abs_IDX_3 | NONCLUSTERED | non | raison, date_debut |
| pers_abs_IDX_2 | NONCLUSTERED | non | date_debut |

