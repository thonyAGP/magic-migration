# import_avertiss__an_val

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `iva_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `iva_code_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `iva_num_import` | int | 10 | non |  | 1 |
| 4 | `iva_date_import` | char | 8 | non |  | 1 |
| 5 | `iva_numero_compte` | int | 10 | non |  | 1 |
| 6 | `iva_filliation_compte` | smallint | 5 | non |  | 3 |
| 7 | `iva_numero_adherent` | float | 53 | non |  | 1 |
| 8 | `iva_fillition_adherent` | smallint | 5 | non |  | 3 |
| 9 | `iva_numero_dossier` | int | 10 | non |  | 1 |
| 10 | `iva_numero_ordre` | int | 10 | non |  | 3 |
| 11 | `iva_nom` | nvarchar | 30 | non |  | 1 |
| 12 | `iva_prenom` | nvarchar | 20 | non |  | 3 |
| 13 | `iva_type_de_client` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `iva_code_societe` (1 valeurs)

```
C
```

### `iva_code_lieu_sejour` (1 valeurs)

```
G
```

### `iva_num_import` (1 valeurs)

```
1429
```

### `iva_date_import` (1 valeurs)

```
20251224
```

### `iva_numero_compte` (1 valeurs)

```
678357
```

### `iva_filliation_compte` (3 valeurs)

```
1, 2, 3
```

### `iva_numero_adherent` (1 valeurs)

```
1.66339e+007
```

### `iva_fillition_adherent` (3 valeurs)

```
1, 2, 3
```

### `iva_numero_dossier` (1 valeurs)

```
194343754
```

### `iva_numero_ordre` (3 valeurs)

```
1, 2, 3
```

### `iva_nom` (1 valeurs)

```
BROWN
```

### `iva_prenom` (3 valeurs)

```
Ethan, Jay, Maxine
```

### `iva_type_de_client` (1 valeurs)

```
C
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| annulation001_dat_IDX_1 | NONCLUSTERED | oui | iva_code_societe, iva_num_import, iva_date_import, iva_nom, iva_prenom, iva_numero_adherent, iva_fillition_adherent, iva_type_de_client |

