# cafil002_dat

| Info | Valeur |
|------|--------|
| Lignes | 214 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `prn_num_terminal` | int | 10 | non |  | 214 |
| 2 | `prn_nom_terminal` | nvarchar | 30 | non |  | 147 |
| 3 | `prn_code_imprimante` | int | 10 | non |  | 4 |
| 4 | `prn_nb_lignes_page` | int | 10 | non |  | 1 |
| 5 | `prn_en_tete` | nvarchar | 1 | non |  | 2 |
| 6 | `date_purge` | char | 8 | non |  | 1 |
| 7 | `prn_hostname` | nvarchar | 50 | oui |  | 0 |

## Valeurs distinctes

### `prn_code_imprimante` (4 valeurs)

```
0, 1, 5, 7
```

### `prn_nb_lignes_page` (1 valeurs)

```
0
```

### `prn_en_tete` (2 valeurs)

```
, O
```

### `date_purge` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil002_dat_IDX_1 | NONCLUSTERED | oui | prn_num_terminal |

