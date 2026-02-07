# cafil047_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ini_code_village_3` | nvarchar | 3 | non |  | 1 |
| 2 | `ini_nom_village` | nvarchar | 30 | non |  | 1 |
| 3 | `ini_telephone` | nvarchar | 15 | non |  | 1 |
| 4 | `ini_fax` | nvarchar | 15 | non |  | 1 |
| 5 | `ini_devise_locale` | nvarchar | 3 | non |  | 1 |
| 6 | `ini_nbre_decimales` | int | 10 | non |  | 1 |
| 7 | `date_purge` | char | 8 | non |  | 1 |

## Valeurs distinctes

### `ini_code_village_3` (1 valeurs)

```
116
```

### `ini_nom_village` (1 valeurs)

```
HOLIDAY VILLAGES
```

### `ini_fax` (1 valeurs)

```
(66) 763 304 45
```

### `ini_devise_locale` (1 valeurs)

```
THB
```

### `ini_nbre_decimales` (1 valeurs)

```
2
```

### `date_purge` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil047_dat_IDX_1 | NONCLUSTERED | oui | ini_code_village_3 |

