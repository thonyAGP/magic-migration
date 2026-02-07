# ecran_par

| Info | Valeur |
|------|--------|
| Lignes | 1599 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 4 | non |  | 2 |
| 2 | `numero_ecran` | int | 10 | non |  | 233 |
| 3 | `type_de_programme` | nvarchar | 5 | non |  | 15 |
| 4 | `type_ecran` | nvarchar | 6 | non |  | 795 |
| 5 | `titre` | nvarchar | 30 | non |  | 1358 |

## Valeurs distinctes

### `code_langue` (2 valeurs)

```
ANG, FRA
```

### `type_de_programme` (15 valeurs)

```
CA, CB, CF, CG, CM, CP, CV, GA, LO, M3, PB, PP, PS, PT, T3
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ecran_par_IDX_1 | NONCLUSTERED | oui | code_langue, numero_ecran, type_de_programme |

