# cctype

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_credit` | nvarchar | 2 | non |  | 12 |
| 2 | `libelle_credit` | nvarchar | 20 | non |  | 12 |
| 3 | `affectable_gm` | bit |  | non |  | 2 |
| 4 | `affectable_go` | bit |  | non |  | 2 |
| 5 | `ventilation` | nvarchar | 1 | non |  | 3 |

## Valeurs distinctes

### `code_credit` (12 valeurs)

```
05, 10, 20, 25, 30, 35, 40, 45, 50, 60, 65, 99
```

### `libelle_credit` (12 valeurs)

```
Anniversaire GO, Avance SÃ©minaire, Avoir, CM artistes, CM School, CrÃ©dit GO, Gift Pass, GO Office, GO vacances, Honeymoon Asia, Honeymoon Europe, Reprise carnet bar
```

### `affectable_gm` (2 valeurs)

```
0, 1
```

### `affectable_go` (2 valeurs)

```
0, 1
```

### `ventilation` (3 valeurs)

```
, 1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cctype_IDX_2 | NONCLUSTERED | oui | libelle_credit |
| cctype_IDX_1 | NONCLUSTERED | oui | code_credit |

