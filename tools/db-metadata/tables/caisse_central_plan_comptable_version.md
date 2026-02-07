# caisse_central_plan_comptable_version

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 1 |
| 2 | `societe` | nvarchar | 1 | non |  | 1 |
| 3 | `a_partir_du` | char | 8 | non |  | 1 |
| 4 | `date_histo` | char | 8 | non |  | 1 |
| 5 | `time_histo` | char | 6 | non |  | 1 |
| 6 | `qui_histo` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `chrono` (1 valeurs)

```
1
```

### `societe` (1 valeurs)

```
C
```

### `a_partir_du` (1 valeurs)

```
20101018
```

### `date_histo` (1 valeurs)

```
20131127
```

### `time_histo` (1 valeurs)

```
030614
```

### `qui_histo` (1 valeurs)

```
DSIOP
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_plan_comptable_version_IDX_1 | NONCLUSTERED | oui | chrono |

