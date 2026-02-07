# paysnationalite_dat

| Info | Valeur |
|------|--------|
| Lignes | 316 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pn_code_langue` | nvarchar | 1 | non |  | 2 |
| 2 | `pn_libelle` | nvarchar | 19 | non |  | 263 |
| 3 | `pn_continent` | nvarchar | 1 | non |  | 1 |
| 4 | `pn_code_pays` | nvarchar | 2 | non |  | 158 |
| 5 | `pn_bresil_number` | numeric | 10 | non |  | 152 |
| 6 | `pn_regroupement` | nchar | 20 | non |  | 2 |
| 7 | `pn_turkey_number` | int | 10 | non |  | 150 |

## Valeurs distinctes

### `pn_code_langue` (2 valeurs)

```
F, G
```

### `pn_regroupement` (2 valeurs)

```
                    , MERCOSUL            
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| paysnationalite_dat_IDX_1 | NONCLUSTERED | oui | pn_code_langue, pn_code_pays, pn_libelle |

