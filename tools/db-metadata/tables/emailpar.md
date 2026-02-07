# emailpar

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `emp_langue` | nvarchar | 3 | non |  | 2 |
| 2 | `emp_etat_code` | nvarchar | 4 | non |  | 4 |
| 3 | `emp_libelle` | nvarchar | 25 | non |  | 8 |
| 4 | `emp_couleur` | int | 10 | non |  | 3 |

## Valeurs distinctes

### `emp_langue` (2 valeurs)

```
ANG, FRA
```

### `emp_etat_code` (4 valeurs)

```
, NA, PMSA, PMSR
```

### `emp_libelle` (8 valeurs)

```
AcceptÃ© PMS, Accepted PMS, Non reÃ§u NA, Not received NA, Received NA, ReÃ§u NA, RefusÃ© PMS, Refused PMS
```

### `emp_couleur` (3 valeurs)

```
153, 166, 7
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| emailpar_IDX_1 | NONCLUSTERED | oui | emp_langue, emp_etat_code |

