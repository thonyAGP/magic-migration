# excures_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rcg_num_terminal` | int | 10 | non |  | 1 |
| 2 | `rcg_flag_traitement` | nvarchar | 1 | non |  | 1 |
| 3 | `rcg_hostname` | nvarchar | 50 | non |  | 3 |

## Valeurs distinctes

### `rcg_num_terminal` (1 valeurs)

```
0
```

### `rcg_flag_traitement` (1 valeurs)

```
C
```

### `rcg_hostname` (3 valeurs)

```
CMAWS8967768049, PHUCWS0181, PHUCWS0189
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excures_dat_IDX_1 | NONCLUSTERED | oui | rcg_num_terminal, rcg_hostname, rcg_flag_traitement |

