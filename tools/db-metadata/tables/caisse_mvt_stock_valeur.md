# caisse_mvt_stock_valeur

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 7 |
| 2 | `date_comptable` | char | 8 | non |  | 5 |
| 3 | `montant` | float | 53 | non |  | 5 |

## Valeurs distinctes

### `chrono` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `date_comptable` (5 valeurs)

```
20220319, 20220405, 20221113, 20251107, 20251111
```

### `montant` (5 valeurs)

```
-13630, -226500, -453000, -477160, 906000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_mvt_stock_valeur_IDX_1 | NONCLUSTERED | oui | chrono |
| caisse_mvt_stock_valeur_IDX_2 | NONCLUSTERED | non | date_comptable |

