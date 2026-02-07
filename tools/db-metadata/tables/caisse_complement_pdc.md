# caisse_complement_pdc

| Info | Valeur |
|------|--------|
| Lignes | 19653 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero_pdc` | int | 10 | non |  | 19653 |
| 3 | `chrono` | int | 10 | non |  | 1 |
| 4 | `libelle_long` | nvarchar | 64 | non |  | 15683 |
| 5 | `recu` | nvarchar | 32 | non |  | 4465 |
| 6 | `code_tpe` | nvarchar | 1 | non |  | 2 |
| 7 | `ajustement_solde` | nvarchar | 1 | non |  | 2 |
| 8 | `code_service_encaissement` | nvarchar | 5 | non |  | 9 |
| 9 | `terminal_ims` | int | 10 | non |  | 27 |
| 10 | `libre` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `chrono` (1 valeurs)

```
1
```

### `code_tpe` (2 valeurs)

```
, T
```

### `ajustement_solde` (2 valeurs)

```
, C
```

### `code_service_encaissement` (9 valeurs)

```
, BARD, BOUT, ESTH, EXCU, PHOT, REST, SKIN, SPNA
```

### `terminal_ims` (27 valeurs)

```
0, 1, 12, 13, 14, 21, 22, 23, 24, 28, 32, 4, 550, 551, 553, 555, 770, 80, 800, 801, 802, 810, 920, 940, 941, 942, 960
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_complement_pdc_IDX_1 | NONCLUSTERED | oui | societe, numero_pdc, chrono |

