# exmessage_par

| Info | Valeur |
|------|--------|
| Lignes | 246 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 4 | non |  | 2 |
| 2 | `code` | int | 10 | non |  | 53 |
| 3 | `type_de_programme` | nvarchar | 5 | non |  | 4 |
| 4 | `message` | nvarchar | 70 | non |  | 170 |

## Valeurs distinctes

### `code_langue` (2 valeurs)

```
ANG, FRA
```

### `type_de_programme` (4 valeurs)

```
CF, EA, EI, EM
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| exmessage_par_IDX_1 | NONCLUSTERED | oui | code_langue, code, type_de_programme |

