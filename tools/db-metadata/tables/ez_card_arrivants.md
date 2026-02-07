# ez_card_arrivants

| Info | Valeur |
|------|--------|
| Lignes | 6610 |
| Colonnes | 16 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `carte` | nvarchar | 10 | non |  | 6610 |
| 2 | `societe` | nvarchar | 1 | non |  | 1 |
| 3 | `type_client` | nvarchar | 1 | non |  | 2 |
| 4 | `adherent` | float | 53 | non |  | 2702 |
| 5 | `filiation_club` | smallint | 5 | non |  | 24 |
| 6 | `compte_old` | int | 10 | non |  | 2617 |
| 7 | `filiation_old` | smallint | 5 | non |  | 18 |
| 8 | `compte_new` | int | 10 | non |  | 2617 |
| 9 | `filiation_new` | smallint | 5 | non |  | 18 |
| 10 | `gmc_etat` | nvarchar | 1 | non |  | 2 |
| 11 | `gmc_nom` | nvarchar | 30 | non |  | 2560 |
| 12 | `gmc_prenom` | nvarchar | 20 | non |  | 5319 |
| 13 | `dossier` | int | 10 | non |  | 2030 |
| 14 | `reaezcard` | nvarchar | 1 | non |  | 1 |
| 15 | `cc_total` | float | 53 | non |  | 51 |
| 16 | `bl` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `type_client` (2 valeurs)

```
B, C
```

### `filiation_club` (24 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 83, 9, 93
```

### `filiation_old` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `filiation_new` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gmc_etat` (2 valeurs)

```
, M
```

### `reaezcard` (1 valeurs)

```
O
```

### `bl` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ezcardarr_dat_IDX_1 | NONCLUSTERED | oui | carte |
| ezcardarr_dat_IDX_3 | NONCLUSTERED | non | gmc_etat |
| ezcardarr_dat_IDX_2 | NONCLUSTERED | oui | societe, type_client, adherent, filiation_club |

