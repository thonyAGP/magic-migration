# caisse_mvt_stock_histo

| Info | Valeur |
|------|--------|
| Lignes | 26 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 26 |
| 2 | `utilisateur` | nvarchar | 8 | non |  | 2 |
| 3 | `quand` | nvarchar | 1 | non |  | 1 |
| 4 | `quoi` | nvarchar | 1 | non |  | 1 |
| 5 | `ordre` | int | 10 | non |  | 4 |
| 6 | `type` | nvarchar | 3 | non |  | 1 |
| 7 | `libelle` | nvarchar | 16 | non |  | 4 |
| 8 | `prixunitaire` | float | 53 | non |  | 4 |
| 9 | `quantite` | int | 10 | non |  | 9 |
| 10 | `montant` | float | 53 | non |  | 13 |
| 11 | `code_article` | int | 10 | non |  | 4 |
| 12 | `chrono_mvt` | float | 53 | non |  | 7 |
| 13 | `type_mvt` | nvarchar | 1 | non |  | 2 |
| 14 | `date` | char | 8 | non |  | 5 |
| 15 | `heure` | char | 6 | non |  | 7 |

## Valeurs distinctes

### `chrono` (26 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 3, 4, 5, 6, 7, 8, 9
```

### `utilisateur` (2 valeurs)

```
ASSTFAM, FAM
```

### `quoi` (1 valeurs)

```
A
```

### `ordre` (4 valeurs)

```
1, 2, 3, 4
```

### `type` (1 valeurs)

```
ART
```

### `libelle` (4 valeurs)

```
1D PREMIUM, 1D SILVER, 1W SILVER M, 7D PREMIUM
```

### `prixunitaire` (4 valeurs)

```
105, 1300, 210, 650
```

### `quantite` (9 valeurs)

```
10, 100, 194, 200, 272, 286, 3, 400, 50
```

### `montant` (13 valeurs)

```
10500, 13000, 130000, 185900, 21000, 252200, 260000, 28560, 42000, 520000, 630, 65000, 84000
```

### `code_article` (4 valeurs)

```
553, 554, 555, 557
```

### `chrono_mvt` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `type_mvt` (2 valeurs)

```
E, S
```

### `date` (5 valeurs)

```
20220319, 20220405, 20221113, 20251107, 20251111
```

### `heure` (7 valeurs)

```
155951, 161436, 173426, 173458, 215225, 215244, 225514
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_mvt_stock_histo_IDX_2 | NONCLUSTERED | non | chrono_mvt |
| caisse_mvt_stock_histo_IDX_1 | NONCLUSTERED | oui | chrono |

