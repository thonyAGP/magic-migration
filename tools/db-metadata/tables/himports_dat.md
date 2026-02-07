# himports_dat

| Info | Valeur |
|------|--------|
| Lignes | 214653 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 10 | non |  | 1 |
| 2 | `numero_adherent` | float | 53 | non |  | 1052 |
| 3 | `ordre_adherent` | int | 10 | non |  | 17 |
| 4 | `dossier` | float | 53 | non |  | 1070 |
| 5 | `numero_ordre` | int | 10 | non |  | 15 |
| 6 | `numero_ressource` | float | 53 | non |  | 32174 |
| 7 | `fra___ide` | nvarchar | 3 | non |  | 2 |
| 8 | `type` | nvarchar | 1 | non |  | 6 |
| 9 | `chaine` | nvarchar | 600 | non |  | 15307 |
| 10 | `RowId_338` | int | 10 | non |  | 214653 |

## Valeurs distinctes

### `utilisateur` (1 valeurs)

```
CMED
```

### `ordre_adherent` (17 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 2, 22, 3, 4, 5, 6, 7, 8, 9
```

### `numero_ordre` (15 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 8, 9
```

### `fra___ide` (2 valeurs)

```
FRA, IDE
```

### `type` (6 valeurs)

```
, 3, 4, 7, 8, R
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| himports_dat_IDX_1 | NONCLUSTERED | non | utilisateur, numero_adherent, ordre_adherent, fra___ide, type |
| himports_dat_IDX_3 | NONCLUSTERED | non | dossier |
| himports_dat_IDX_2 | NONCLUSTERED | non | utilisateur, numero_ressource |
| himports_dat_IDX_4 | NONCLUSTERED | oui | RowId_338 |

