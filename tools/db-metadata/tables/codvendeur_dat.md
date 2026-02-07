# codvendeur_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | int | 10 | non |  | 4 |
| 2 | `nom___prenom` | nvarchar | 40 | non |  | 4 |

## Valeurs distinctes

### `code` (4 valeurs)

```
0, 1, 3, 4
```

### `nom___prenom` (4 valeurs)

```
AKI, BULET, MEGAN, SUNNY
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| codvendeur_dat_IDX_1 | NONCLUSTERED | oui | code |

