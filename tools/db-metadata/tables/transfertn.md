# transfertn

| Info | Valeur |
|------|--------|
| Lignes | 9293 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `trf_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `trf_compte` | int | 10 | non |  | 1762 |
| 3 | `trf_filiation` | int | 10 | non |  | 18 |
| 4 | `trf_date` | char | 8 | non |  | 479 |
| 5 | `trf_heure` | char | 6 | non |  | 230 |
| 6 | `trf_code_aer` | nvarchar | 6 | non |  | 7 |
| 7 | `trf_vol` | nvarchar | 10 | non |  | 610 |
| 8 | `trf_commentaire` | nvarchar | 30 | non |  | 296 |
| 9 | `trf_type` | nvarchar | 2 | non |  | 1 |
| 10 | `trf_sens` | nvarchar | 1 | non |  | 2 |
| 11 | `trf_compagnie` | nvarchar | 9 | non |  | 218 |
| 12 | `trf_compagnie_prec` | nvarchar | 9 | non |  | 2 |
| 13 | `trf_vol_precedent` | nvarchar | 10 | non |  | 2 |
| 14 | `trf_vente_locale` | bit |  | non |  | 2 |
| 15 | `trf_montant` | float | 53 | non |  | 20 |
| 16 | `trf_date_comptable` | char | 8 | non |  | 120 |
| 17 | `trf_date_operation` | char | 8 | non |  | 120 |
| 18 | `trf_table_vente` | nvarchar | 1 | non |  | 3 |
| 19 | `trf_id_vente` | bigint | 19 | non |  | 304 |

## Valeurs distinctes

### `trf_societe` (1 valeurs)

```
C
```

### `trf_filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `trf_code_aer` (7 valeurs)

```
apt, APT, BKK, HAN, hkt, HKT, THK
```

### `trf_type` (1 valeurs)

```
PL
```

### `trf_sens` (2 valeurs)

```
A, R
```

### `trf_compagnie_prec` (2 valeurs)

```
, null
```

### `trf_vol_precedent` (2 valeurs)

```
, null
```

### `trf_vente_locale` (2 valeurs)

```
0, 1
```

### `trf_montant` (20 valeurs)

```
0, 1053, 1100, 1400, 1800, 1850, 2000, 3000, 3500, 3600, 500, 600, 6800, 700, 750, 8000, 850, 8600, 900, 947
```

### `trf_table_vente` (3 valeurs)

```
, C, V
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| transfertn_IDX_1 | NONCLUSTERED | oui | trf_date, trf_sens, trf_heure, trf_societe, trf_compte, trf_filiation |

