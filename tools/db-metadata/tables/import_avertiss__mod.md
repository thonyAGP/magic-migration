# import_avertiss__mod

| Info | Valeur |
|------|--------|
| Lignes | 221 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mod_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `mod_code_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `mod_num_import` | int | 10 | non |  | 1 |
| 4 | `mod_date_import` | char | 8 | non |  | 1 |
| 5 | `mod_statut` | nvarchar | 10 | non |  | 1 |
| 6 | `mod_libelle` | nvarchar | 40 | non |  | 221 |
| 7 | `mod_code` | nvarchar | 1 | non |  | 1 |
| 8 | `mod_dossier` | int | 10 | non |  | 61 |
| 9 | `mod_numero_adherent` | int | 10 | non |  | 64 |
| 10 | `mod_filiation` | smallint | 5 | non |  | 12 |
| 11 | `mod_numero_compte` | int | 10 | non |  | 64 |
| 12 | `mod_filiation_compte` | smallint | 5 | non |  | 10 |
| 13 | `mod_type_de_modif` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `mod_code_societe` (1 valeurs)

```
C
```

### `mod_code_lieu_sejour` (1 valeurs)

```
G
```

### `mod_num_import` (1 valeurs)

```
1429
```

### `mod_date_import` (1 valeurs)

```
20251224
```

### `mod_statut` (1 valeurs)

```
Modif
```

### `mod_code` (1 valeurs)

```
J
```

### `mod_filiation` (12 valeurs)

```
0, 1, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `mod_filiation_compte` (10 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| impormods_dat_IDX_1 | NONCLUSTERED | oui | mod_code_societe, mod_num_import, mod_date_import, mod_statut, mod_libelle |

