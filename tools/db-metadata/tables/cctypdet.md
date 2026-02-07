# cctypdet

| Info | Valeur |
|------|--------|
| Lignes | 2747 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_8chiffres` | int | 10 | non |  | 1445 |
| 3 | `filiation` | int | 10 | non |  | 11 |
| 4 | `type_de_credit` | nvarchar | 2 | non |  | 3 |
| 5 | `montant` | float | 53 | non |  | 152 |
| 6 | `date_operation` | char | 8 | non |  | 394 |
| 7 | `time_operation` | char | 6 | non |  | 1802 |
| 8 | `utilisateur` | nvarchar | 10 | non |  | 23 |
| 9 | `RowId_272` | int | 10 | non |  | 2747 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type_de_credit` (3 valeurs)

```
05, 30, 99
```

### `utilisateur` (23 valeurs)

```
AFFAUTO, ARKON, Bar manage, BAR1, BARMGR, BEAM, DOREEN, ESTELLE, Excursion, FAM, GIFT, JAA, JULIA, MIND, NANA, NUENG, OAT, PLANNING, Restaurant, Scuba Divi, Spa, SPA Manage, TOMOKA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cctypdet_IDX_2 | NONCLUSTERED | oui | RowId_272 |
| cctypdet_IDX_1 | NONCLUSTERED | non | societe, code_8chiffres, filiation, type_de_credit |

