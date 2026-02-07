# message_par

| Info | Valeur |
|------|--------|
| Lignes | 1662 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 4 | non |  | 2 |
| 2 | `code` | int | 10 | non |  | 231 |
| 3 | `type_de_programme` | nvarchar | 5 | non |  | 14 |
| 4 | `message` | nvarchar | 70 | non |  | 1487 |

## Valeurs distinctes

### `code_langue` (2 valeurs)

```
ANG, FRA
```

### `type_de_programme` (14 valeurs)

```
, CA, CB, CF, CG, CM, CP, CV, GA, LO, PB, PP, PS, PT
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| message_par_IDX_1 | NONCLUSTERED | oui | code_langue, code, type_de_programme |

