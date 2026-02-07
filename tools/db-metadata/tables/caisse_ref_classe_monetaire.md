# caisse_ref_classe_monetaire

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tab_nom_table` | nvarchar | 5 | non |  | 1 |
| 2 | `tab_nom_interne_code` | nvarchar | 5 | non |  | 1 |
| 3 | `tab_code_alpha5` | nvarchar | 5 | non |  | 1 |
| 4 | `tab_code_numeric6` | int | 10 | non |  | 6 |
| 5 | `tab_classe` | nvarchar | 6 | non |  | 6 |
| 6 | `tab_valeur_numerique` | float | 53 | non |  | 1 |
| 7 | `tab_libelle20` | nvarchar | 20 | non |  | 6 |
| 8 | `tab_libelle10_upper` | nvarchar | 10 | non |  | 1 |
| 9 | `tab_code_droit_modif` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `tab_nom_table` (1 valeurs)

```
$CLAS
```

### `tab_code_numeric6` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `tab_classe` (6 valeurs)

```
$CARD, $CASH, $PAPER, CHGE, OD, PERS
```

### `tab_valeur_numerique` (1 valeurs)

```
0
```

### `tab_libelle20` (6 valeurs)

```
Cartes de crÃ©dit, Change, EspÃ¨ces, Garantie personnelle, Monnaie papier, O.D.
```

### `tab_code_droit_modif` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_classe_monetaire_IDX_1 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_alpha5 |
| caisse_ref_classe_monetaire_IDX_3 | NONCLUSTERED | oui | tab_nom_table, tab_code_numeric6, tab_code_alpha5 |
| caisse_ref_classe_monetaire_IDX_2 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_numeric6 |

