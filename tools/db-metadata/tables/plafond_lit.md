# plafond_lit

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pll_date` | char | 8 | non |  | 9 |
| 2 | `pll_plafond` | int | 10 | non |  | 7 |
| 3 | `pll_lieu_sejour` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `pll_date` (9 valeurs)

```
20220323, 20220324, 20220325, 20220326, 20220327, 20220328, 20220329, 20220330, 20220331
```

### `pll_plafond` (7 valeurs)

```
627, 631, 632, 640, 646, 647, 649
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| plafond_lit_IDX_1 | NONCLUSTERED | oui | pll_lieu_sejour, pll_date |

