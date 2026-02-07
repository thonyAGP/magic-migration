# cafil088_dat

| Info | Valeur |
|------|--------|
| Lignes | 999 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `num_station` | int | 10 | non |  | 999 |
| 2 | `libelle_station` | nvarchar | 25 | non |  | 896 |
| 3 | `processeur` | nvarchar | 1 | non |  | 1 |
| 4 | `libelle_processeur` | nvarchar | 8 | non |  | 1 |
| 5 | `vitesse` | nvarchar | 1 | non |  | 1 |
| 6 | `libelle_vitesse` | nvarchar | 8 | non |  | 1 |
| 7 | `imprimante` | nvarchar | 1 | non |  | 2 |
| 8 | `libelle_imprimante` | nvarchar | 20 | non |  | 3 |
| 9 | `taille_papier` | nvarchar | 1 | non |  | 2 |
| 10 | `libelle_papier` | nvarchar | 8 | non |  | 2 |
| 11 | `lecteur` | nvarchar | 1 | non |  | 2 |
| 12 | `libelle_lecteur` | nvarchar | 8 | non |  | 2 |
| 13 | `disque_local` | nvarchar | 1 | non |  | 2 |
| 14 | `libelle_disque` | nvarchar | 8 | non |  | 2 |
| 15 | `ram_disk` | nvarchar | 1 | non |  | 1 |
| 16 | `libelle_ram_disk` | nvarchar | 8 | non |  | 1 |
| 17 | `reserve` | nvarchar | 1 | non |  | 1 |
| 18 | `reserve2` | nvarchar | 8 | non |  | 1 |
| 19 | `reserve3` | nvarchar | 1 | non |  | 1 |
| 20 | `reserve4` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `processeur` (1 valeurs)

```
4
```

### `libelle_processeur` (1 valeurs)

```
486
```

### `vitesse` (1 valeurs)

```
3
```

### `libelle_vitesse` (1 valeurs)

```
33MHZ
```

### `imprimante` (2 valeurs)

```
0, E
```

### `libelle_imprimante` (3 valeurs)

```
AUCUNE, EPSON LQ1170, EPSON LQ870
```

### `taille_papier` (2 valeurs)

```
0, 8
```

### `libelle_papier` (2 valeurs)

```
80 COL., AUCUN
```

### `lecteur` (2 valeurs)

```
N, O
```

### `libelle_lecteur` (2 valeurs)

```
A:, AUCUN
```

### `disque_local` (2 valeurs)

```
N, O
```

### `libelle_disque` (2 valeurs)

```
AUCUN, C:
```

### `ram_disk` (1 valeurs)

```
N
```

### `libelle_ram_disk` (1 valeurs)

```
AUCUN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil088_dat_IDX_1 | NONCLUSTERED | oui | num_station |

