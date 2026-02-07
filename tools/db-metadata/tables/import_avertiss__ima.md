# import_avertiss__ima

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ima_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ima_code_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `ima_num_import` | int | 10 | non |  | 1 |
| 4 | `ima_date_import` | char | 8 | non |  | 1 |
| 5 | `ima_statut` | nvarchar | 10 | non |  | 1 |
| 6 | `ima_libelle` | nvarchar | 40 | non |  | 1 |
| 7 | `ima_code` | nvarchar | 1 | non |  | 1 |
| 8 | `ima_dossier` | nvarchar | 9 | non |  | 1 |
| 9 | `ima_dossier_chrono` | nvarchar | 3 | non |  | 1 |
| 10 | `ima_texte` | nvarchar | 30 | non |  | 1 |
| 11 | `ima_dossier_2` | nvarchar | 9 | non |  | 1 |
| 12 | `ima_dossier_chrono_2` | nvarchar | 3 | non |  | 1 |

## Valeurs distinctes

### `ima_code_societe` (1 valeurs)

```
C
```

### `ima_code_lieu_sejour` (1 valeurs)

```
G
```

### `ima_num_import` (1 valeurs)

```
1429
```

### `ima_date_import` (1 valeurs)

```
20251224
```

### `ima_statut` (1 valeurs)

```
Annulation
```

### `ima_libelle` (1 valeurs)

```
GADENNE Caroline R     /C-0022054697-000
```

### `ima_code` (1 valeurs)

```
J
```

### `ima_dossier` (1 valeurs)

```
441104273
```

### `ima_dossier_chrono` (1 valeurs)

```
001
```

### `ima_texte` (1 valeurs)

```
Origine ANN
```

### `ima_dossier_2` (1 valeurs)

```
441104273
```

### `ima_dossier_chrono_2` (1 valeurs)

```
001
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| impor006_dat_IDX_1 | NONCLUSTERED | oui | ima_code_societe, ima_num_import, ima_date_import, ima_statut, ima_libelle |

