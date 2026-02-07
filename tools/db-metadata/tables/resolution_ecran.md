# resolution_ecran

**Nom logique Magic** : `resolution_ecran`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `re_type_resolution` | int | 10 | non |  | 2 |
| 2 | `re_libelle` | nvarchar | 50 | non |  | 2 |
| 3 | `re_largeur` | int | 10 | non |  | 2 |
| 4 | `re_hauteur` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `re_type_resolution` (2 valeurs)

```
1, 2
```

### `re_libelle` (2 valeurs)

```
Tablette type 1280 * 800, Tablette type 1920 * 1200
```

### `re_largeur` (2 valeurs)

```
1280, 1920
```

### `re_hauteur` (2 valeurs)

```
1200, 800
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resolution_ecran_IDX1 | NONCLUSTERED | oui | re_type_resolution |

