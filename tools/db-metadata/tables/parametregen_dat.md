# parametregen_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 21 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `fiscalite_grec` | bit |  | non |  | 1 |
| 3 | `edition_od` | bit |  | non |  | 1 |
| 4 | `operation_durant_cloture` | bit |  | non |  | 1 |
| 5 | `net_time` | bit |  | non |  | 1 |
| 6 | `versionning` | bit |  | non |  | 1 |
| 7 | `sup_locks` | bit |  | non |  | 1 |
| 8 | `age_mineur` | nvarchar | 2 | non |  | 1 |
| 9 | `activation_bar_limit` | nvarchar | 1 | non |  | 1 |
| 10 | `age_bar_limit` | nvarchar | 2 | non |  | 1 |
| 11 | `tai_obligatoire` | nvarchar | 1 | non |  | 1 |
| 12 | `scroll_gm_od_light` | nvarchar | 1 | non |  | 1 |
| 13 | `inhova` | nvarchar | 1 | non |  | 1 |
| 14 | `jours_controle_date` | nvarchar | 2 | non |  | 1 |
| 15 | `interfaces_tpe` | nvarchar | 1 | non |  | 1 |
| 16 | `vide` | nvarchar | 36 | non |  | 1 |
| 17 | `debut_exclu` | char | 6 | non |  | 1 |
| 18 | `fin_exclu` | char | 6 | non |  | 1 |
| 19 | `nbjoursvalidite` | int | 10 | non |  | 1 |
| 20 | `edit_tva_ext_compte` | bit |  | non |  | 1 |
| 21 | `edit_tva_ticket_vente` | bit |  | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `fiscalite_grec` (1 valeurs)

```
0
```

### `edition_od` (1 valeurs)

```
1
```

### `operation_durant_cloture` (1 valeurs)

```
0
```

### `net_time` (1 valeurs)

```
1
```

### `versionning` (1 valeurs)

```
0
```

### `sup_locks` (1 valeurs)

```
0
```

### `age_mineur` (1 valeurs)

```
20
```

### `activation_bar_limit` (1 valeurs)

```
O
```

### `tai_obligatoire` (1 valeurs)

```
1
```

### `scroll_gm_od_light` (1 valeurs)

```
O
```

### `jours_controle_date` (1 valeurs)

```
3
```

### `debut_exclu` (1 valeurs)

```
000000
```

### `fin_exclu` (1 valeurs)

```
000000
```

### `nbjoursvalidite` (1 valeurs)

```
0
```

### `edit_tva_ext_compte` (1 valeurs)

```
0
```

### `edit_tva_ticket_vente` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| parametregen_dat_IDX_1 | NONCLUSTERED | oui | societe |

