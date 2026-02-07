# cafil097_dat

| Info | Valeur |
|------|--------|
| Lignes | 184 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 1 | non |  | 1 |
| 2 | `libelle` | nvarchar | 50 | non |  | 184 |
| 3 | `code_pays` | nvarchar | 2 | non |  | 159 |
| 4 | `langue_parlee` | nvarchar | 2 | non |  | 7 |
| 5 | `monnaie` | nvarchar | 4 | non |  | 6 |
| 6 | `code_telephone` | int | 10 | non |  | 58 |
| 7 | `fete_nationale` | char | 8 | non |  | 3 |
| 8 | `fuseau_horaire` | int | 10 | non |  | 1 |
| 9 | `decalage_horaire` | int | 10 | non |  | 1 |
| 10 | `inscription` | nvarchar | 3 | non |  | 1 |
| 11 | `acces_standard` | nvarchar | 1 | non |  | 2 |
| 12 | `acces_planning` | nvarchar | 1 | non |  | 2 |
| 13 | `acces_caisse` | nvarchar | 1 | non |  | 2 |
| 14 | `code_pays_normalise` | nvarchar | 3 | non |  | 156 |

## Valeurs distinctes

### `code_langue` (1 valeurs)

```
F
```

### `langue_parlee` (7 valeurs)

```
, 1, 2, 3, 4, 5, 6
```

### `monnaie` (6 valeurs)

```
, CFP, DMK, FFR, FRB, USD
```

### `fete_nationale` (3 valeurs)

```
20140104, 20140704, 20140714
```

### `fuseau_horaire` (1 valeurs)

```
0
```

### `decalage_horaire` (1 valeurs)

```
0
```

### `acces_standard` (2 valeurs)

```
N, O
```

### `acces_planning` (2 valeurs)

```
N, O
```

### `acces_caisse` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil097_dat_IDX_1 | NONCLUSTERED | oui | code_langue, code_pays, libelle |
| cafil097_dat_IDX_3 | NONCLUSTERED | non | code_langue, libelle, acces_planning |
| cafil097_dat_IDX_2 | NONCLUSTERED | non | code_langue, libelle, acces_standard |

