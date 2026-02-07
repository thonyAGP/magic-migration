# fidcumul

| Info | Valeur |
|------|--------|
| Lignes | 1072 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fid_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `fid_compte` | int | 10 | non |  | 383 |
| 3 | `fid_filiation` | int | 10 | non |  | 20 |
| 4 | `fid_code_fidelisation` | nvarchar | 1 | non |  | 1 |
| 5 | `fid_date_debut` | char | 8 | non |  | 198 |
| 6 | `fid_date_fin` | char | 8 | non |  | 204 |
| 7 | `fid_nb_jours` | int | 10 | non |  | 85 |
| 8 | `fid_montant` | float | 53 | non |  | 224 |
| 9 | `fid_upg1` | bit |  | non |  | 2 |
| 10 | `fid_upg2` | bit |  | non |  | 2 |

## Valeurs distinctes

### `fid_societe` (1 valeurs)

```
C
```

### `fid_filiation` (20 valeurs)

```
0, 1, 10, 11, 12, 14, 15, 16, 19, 2, 28, 29, 3, 30, 4, 5, 6, 7, 8, 9
```

### `fid_code_fidelisation` (1 valeurs)

```
G
```

### `fid_upg1` (2 valeurs)

```
0, 1
```

### `fid_upg2` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fidcumul_IDX_2 | NONCLUSTERED | oui | fid_date_debut, fid_montant, fid_upg1, fid_upg2, fid_societe, fid_compte, fid_filiation |
| fidcumul_IDX_1 | NONCLUSTERED | oui | fid_societe, fid_compte, fid_filiation |

