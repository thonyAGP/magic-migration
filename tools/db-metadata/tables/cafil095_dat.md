# cafil095_dat

| Info | Valeur |
|------|--------|
| Lignes | 121 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom_de_table` | nvarchar | 5 | non |  | 10 |
| 3 | `code_langue` | nvarchar | 1 | non |  | 1 |
| 4 | `code_alpha6` | nvarchar | 6 | non |  | 33 |
| 5 | `libelle_dix` | nvarchar | 10 | non |  | 9 |
| 6 | `libelle_trente` | nvarchar | 30 | non |  | 113 |
| 7 | `code_numerique` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `nom_de_table` (10 valeurs)

```
SANIM, SBOUT, SCONT, SECON, SENFA, SGEST, SMAIN, SSEMI, SSERV, SSPOR
```

### `code_langue` (1 valeurs)

```
F
```

### `code_alpha6` (33 valeurs)

```
01, 02, 03, 04, 05, 06, 07, 08, 99, A01, A02, A03, A04, A05, A06, A07, A08, A09, A10, A11, A12, A13, B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, Z99
```

### `libelle_dix` (9 valeurs)

```
, SANIM, SBOUT, SECON, SENFA, SGEST, SMAIN, SSEMI, SSPOR
```

### `code_numerique` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil095_dat_IDX_1 | NONCLUSTERED | oui | societe, nom_de_table, code_langue, code_alpha6 |

