# cafil099_dat

| Info | Valeur |
|------|--------|
| Lignes | 55 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pay_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `pay_num_vente` | nvarchar | 3 | non |  | 55 |
| 3 | `pay_code_nationalite` | nvarchar | 2 | non |  | 53 |
| 4 | `pay_code_langue` | nvarchar | 1 | non |  | 7 |
| 5 | `pay_code_vente` | nvarchar | 3 | non |  | 53 |
| 6 | `pay_libelle` | nvarchar | 25 | non |  | 55 |

## Valeurs distinctes

### `pay_societe` (1 valeurs)

```
C
```

### `pay_code_langue` (7 valeurs)

```
, 1, 2, 3, 4, 5, 6
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil099_dat_IDX_1 | NONCLUSTERED | oui | pay_societe, pay_num_vente |

