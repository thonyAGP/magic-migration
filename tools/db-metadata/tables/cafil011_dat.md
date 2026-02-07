# cafil011_dat

| Info | Valeur |
|------|--------|
| Lignes | 25441 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pre_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `pre_num_compte` | int | 10 | non |  | 5003 |
| 3 | `pre_filiation` | int | 10 | non |  | 19 |
| 4 | `pre_code_circuit` | nvarchar | 6 | non |  | 53 |
| 5 | `pre_date_debut` | char | 8 | non |  | 346 |
| 6 | `pre_date_fin` | char | 8 | non |  | 335 |
| 7 | `pre_montant` | float | 53 | non |  | 1042 |
| 8 | `pre_stype_tm` | nvarchar | 2 | non |  | 1 |
| 9 | `pre_date_import` | char | 8 | non |  | 315 |
| 10 | `pre_code_categorie` | nvarchar | 3 | non |  | 15 |

## Valeurs distinctes

### `pre_societe` (1 valeurs)

```
C
```

### `pre_filiation` (19 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `pre_code_categorie` (15 valeurs)

```
, CB1, DON, EN2, ENF, EXN, FON, HM4, PB6, SA4, SA8, TSF, TVV, VI9, VSS
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil011_dat_IDX_1 | NONCLUSTERED | oui | pre_societe, pre_num_compte, pre_filiation, pre_date_debut, pre_code_circuit |
| cafil011_dat_IDX_2 | NONCLUSTERED | non | pre_societe, pre_code_circuit |

