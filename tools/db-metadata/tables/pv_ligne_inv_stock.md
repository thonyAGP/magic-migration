# pv_ligne_inv_stock

**Nom logique Magic** : `pv_ligne_inv_stock`

| Info | Valeur |
|------|--------|
| Lignes | 9802 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `invl_service` | nvarchar | 4 | non |  | 2 |
| 2 | `invl_chrono` | float | 53 | non |  | 85 |
| 3 | `invl_cat` | int | 10 | non |  | 9 |
| 4 | `invl_sub_cat` | int | 10 | non |  | 12 |
| 5 | `invl_prod_id` | int | 10 | non |  | 34 |
| 6 | `invl_prod_label` | nvarchar | 20 | non |  | 230 |
| 7 | `invl_pu_achat` | float | 53 | non |  | 169 |
| 8 | `invl_pu_vente` | float | 53 | non |  | 110 |
| 9 | `invl_qte_theorique` | float | 53 | non |  | 522 |
| 10 | `invl_qte_reelle` | float | 53 | non |  | 380 |
| 11 | `invl_commentaire` | nvarchar | 150 | non |  | 204 |

## Valeurs distinctes

### `invl_service` (2 valeurs)

```
BARD, ESTH
```

### `invl_cat` (9 valeurs)

```
1, 11, 2, 3, 4, 5, 6, 7, 8
```

### `invl_sub_cat` (12 valeurs)

```
1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `invl_prod_id` (34 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 35, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_ligne_inv_stock_IDX_1 | NONCLUSTERED | oui | invl_service, invl_chrono, invl_cat, invl_sub_cat, invl_prod_id |

