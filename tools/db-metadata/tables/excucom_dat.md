# excucom_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cte_nom_du_compteur` | nvarchar | 5 | non |  | 4 |
| 2 | `cte_dernier_nombre` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `cte_nom_du_compteur` (4 valeurs)

```
ECHRO, GEVEN, GEXCU, GPLAN
```

### `cte_dernier_nombre` (4 valeurs)

```
266, 28723, 30148, 37
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excucom_dat_IDX_1 | NONCLUSTERED | oui | cte_nom_du_compteur |

