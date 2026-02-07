# import_avertiss__mod2

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mod2_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `mod2_code_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `mod2_num_import` | int | 10 | non |  | 1 |
| 4 | `mod2_date_import` | char | 8 | non |  | 1 |
| 5 | `mod2_statut` | nvarchar | 10 | non |  | 1 |
| 6 | `mod2_libelle` | nvarchar | 40 | non |  | 4 |
| 7 | `mod2_code` | nvarchar | 1 | non |  | 1 |
| 8 | `mod2_dossier` | int | 10 | non |  | 1 |
| 9 | `mod2_numero_adherent` | int | 10 | non |  | 1 |
| 10 | `mod2_filiation` | smallint | 5 | non |  | 4 |
| 11 | `mod2_numero_compte` | int | 10 | non |  | 1 |
| 12 | `mod2_filiation_compte` | smallint | 5 | non |  | 4 |
| 13 | `mod2_type_de_modif` | nvarchar | 1 | non |  | 1 |
| 14 | `mod2_gm_est_valide` | bit |  | non |  | 1 |

## Valeurs distinctes

### `mod2_code_societe` (1 valeurs)

```
C
```

### `mod2_code_lieu_sejour` (1 valeurs)

```
G
```

### `mod2_num_import` (1 valeurs)

```
1429
```

### `mod2_date_import` (1 valeurs)

```
20251224
```

### `mod2_statut` (1 valeurs)

```
Modif
```

### `mod2_libelle` (4 valeurs)

```
CARE Arthur/PLANNING-0072178369-003, CARE Delphine/PLANNING-0072178369-002, CARE Florent/PLANNING-0072178369-001, CARE Victor/PLANNING-0072178369-004
```

### `mod2_code` (1 valeurs)

```
I
```

### `mod2_dossier` (1 valeurs)

```
72178369
```

### `mod2_numero_adherent` (1 valeurs)

```
13958765
```

### `mod2_filiation` (4 valeurs)

```
0, 1, 2, 3
```

### `mod2_numero_compte` (1 valeurs)

```
676475
```

### `mod2_filiation_compte` (4 valeurs)

```
0, 1, 2, 3
```

### `mod2_gm_est_valide` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| impormods2_dat_IDX_1 | NONCLUSTERED | oui | mod2_code_societe, mod2_num_import, mod2_date_import, mod2_statut, mod2_libelle |

