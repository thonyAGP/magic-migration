# cafil060_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ppu_cle` | nvarchar | 1 | non |  | 2 |
| 2 | `ppu_nb_jour_garde` | int | 10 | non |  | 1 |
| 3 | `ppu_directory` | nvarchar | 30 | non |  | 1 |
| 4 | `ppu_delai` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `ppu_cle` (2 valeurs)

```
C, G
```

### `ppu_nb_jour_garde` (1 valeurs)

```
365
```

### `ppu_directory` (1 valeurs)

```
M:\PMS\DATAVAR\SAUVPURG
```

### `ppu_delai` (2 valeurs)

```
2, 7
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil060_dat_IDX_1 | NONCLUSTERED | oui | ppu_cle |

