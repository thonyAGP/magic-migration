# caisse_detail_coffre

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1564 |
| 3 | `total` | float | 53 | non |  | 1182 |
| 4 | `monnaie` | float | 53 | non |  | 1182 |
| 5 | `produits` | float | 53 | non |  | 4 |
| 6 | `cartes` | float | 53 | non |  | 1 |
| 7 | `cheques` | float | 53 | non |  | 1 |
| 8 | `od` | float | 53 | non |  | 1 |
| 9 | `nbre_devises` | int | 10 | non |  | 11 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `produits` (4 valeurs)

```
0, 13630, -453000, 477160
```

### `cartes` (1 valeurs)

```
0
```

### `cheques` (1 valeurs)

```
0
```

### `od` (1 valeurs)

```
0
```

### `nbre_devises` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_detail_coffre_IDX_1 | NONCLUSTERED | oui | societe, date_comptable |

