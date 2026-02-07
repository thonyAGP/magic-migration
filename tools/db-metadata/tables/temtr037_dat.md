# temtr037_dat

| Info | Valeur |
|------|--------|
| Lignes | 108 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `utilisateur` | nvarchar | 10 | non |  | 72 |
| 3 | `qualite` | nvarchar | 7 | non |  | 5 |
| 4 | `nombre` | int | 10 | non |  | 53 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `qualite` (5 valeurs)

```
GM CLUB, GM IGP, GM ORDI, GM SEM, GM VSL
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| temtr037_dat_IDX_1 | NONCLUSTERED | oui | societe, utilisateur, qualite |

