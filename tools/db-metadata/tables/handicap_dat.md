# handicap_dat

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ha_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ha_num_compte` | int | 10 | non |  | 5 |
| 3 | `ha_filiation` | int | 10 | non |  | 2 |
| 4 | `ha_handicap` | bit |  | non |  | 1 |

## Valeurs distinctes

### `ha_societe` (1 valeurs)

```
C
```

### `ha_num_compte` (5 valeurs)

```
503293, 95273, 95388, 95389, 95390
```

### `ha_filiation` (2 valeurs)

```
0, 1
```

### `ha_handicap` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| handicap_dat_IDX_1 | NONCLUSTERED | oui | ha_societe, ha_num_compte, ha_filiation |

