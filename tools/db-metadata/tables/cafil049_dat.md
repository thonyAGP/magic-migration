# cafil049_dat

| Info | Valeur |
|------|--------|
| Lignes | 205 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pur_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `pur_date_purge` | char | 8 | non |  | 205 |
| 3 | `pur_nbre_ss_restruc_` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `pur_societe` (1 valeurs)

```
C
```

### `pur_nbre_ss_restruc_` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil049_dat_IDX_1 | NONCLUSTERED | oui | pur_societe, pur_date_purge |

