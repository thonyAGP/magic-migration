# caisse_detail_coffre_histo

| Info | Valeur |
|------|--------|
| Lignes | 4555 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 4555 |
| 2 | `societe` | nvarchar | 1 | non |  | 1 |
| 3 | `date_comptable` | char | 8 | non |  | 1564 |
| 4 | `total` | float | 53 | non |  | 1996 |
| 5 | `monnaie` | float | 53 | non |  | 1994 |
| 6 | `produits` | float | 53 | non |  | 6 |
| 7 | `cartes` | float | 53 | non |  | 1 |
| 8 | `cheques` | float | 53 | non |  | 1 |
| 9 | `od` | float | 53 | non |  | 1 |
| 10 | `nbre_devises` | int | 10 | non |  | 10 |
| 11 | `last_date_update` | char | 8 | non |  | 1566 |
| 12 | `last_time_update` | char | 6 | non |  | 3490 |
| 13 | `type_mouvement` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `produits` (6 valeurs)

```
0, -13630, 226500, -226500, -453000, 906000
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

### `nbre_devises` (10 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type_mouvement` (1 valeurs)

```
C
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_detail_coffre_histo_IDX_1 | NONCLUSTERED | oui | chrono |

