# cr_trait_arrivant_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 23 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `numero_import` | int | 10 | non |  | 1 |
| 4 | `avertissement_import` | bit |  | non |  | 1 |
| 5 | `avertissement_import_ctr` | int | 10 | non |  | 1 |
| 6 | `avertissement_annul` | bit |  | non |  | 1 |
| 7 | `avertissement_annul_ctr` | int | 10 | non |  | 1 |
| 8 | `avertissement_modif` | bit |  | non |  | 1 |
| 9 | `avertissement_modif_ctr` | int | 10 | non |  | 1 |
| 10 | `annul_non_integree` | bit |  | non |  | 1 |
| 11 | `annul_non_integree_ctr` | int | 10 | non |  | 1 |
| 12 | `annul_integree` | bit |  | non |  | 1 |
| 13 | `annul_integree_ctr` | int | 10 | non |  | 1 |
| 14 | `annul_non_integree_en_modif` | bit |  | non |  | 1 |
| 15 | `annul_non_integree_en_modif_ctr` | int | 10 | non |  | 1 |
| 16 | `cartes_annulees` | bit |  | non |  | 1 |
| 17 | `cartes_annulees_ctr` | int | 10 | non |  | 1 |
| 18 | `cartes_mises_a_jour` | bit |  | non |  | 1 |
| 19 | `cartes_mises_a_jour_ctr` | int | 10 | non |  | 1 |
| 20 | `nouvelles_prestations` | bit |  | non |  | 1 |
| 21 | `nouvelles_prestations_ctr` | int | 10 | non |  | 1 |
| 22 | `nouveaux_aeroports` | bit |  | non |  | 1 |
| 23 | `nouveaux_aeroports_ctr` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `lieu_sejour` (1 valeurs)

```
G
```

### `numero_import` (1 valeurs)

```
1429
```

### `avertissement_import` (1 valeurs)

```
1
```

### `avertissement_import_ctr` (1 valeurs)

```
1
```

### `avertissement_annul` (1 valeurs)

```
1
```

### `avertissement_annul_ctr` (1 valeurs)

```
3
```

### `avertissement_modif` (1 valeurs)

```
1
```

### `avertissement_modif_ctr` (1 valeurs)

```
221
```

### `annul_non_integree` (1 valeurs)

```
0
```

### `annul_non_integree_ctr` (1 valeurs)

```
0
```

### `annul_integree` (1 valeurs)

```
0
```

### `annul_integree_ctr` (1 valeurs)

```
0
```

### `annul_non_integree_en_modif` (1 valeurs)

```
1
```

### `annul_non_integree_en_modif_ctr` (1 valeurs)

```
4
```

### `cartes_annulees` (1 valeurs)

```
0
```

### `cartes_annulees_ctr` (1 valeurs)

```
0
```

### `cartes_mises_a_jour` (1 valeurs)

```
1
```

### `cartes_mises_a_jour_ctr` (1 valeurs)

```
71
```

### `nouvelles_prestations` (1 valeurs)

```
0
```

### `nouvelles_prestations_ctr` (1 valeurs)

```
0
```

### `nouveaux_aeroports` (1 valeurs)

```
1
```

### `nouveaux_aeroports_ctr` (1 valeurs)

```
7
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| crtrar_dat_IDX_1 | NONCLUSTERED | oui | societe, lieu_sejour, numero_import |

