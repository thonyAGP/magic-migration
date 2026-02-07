# caisse_ref_moyen_paiement

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tab_nom_table` | nvarchar | 5 | non |  | 1 |
| 2 | `tab_nom_interne_code` | nvarchar | 5 | non |  | 1 |
| 3 | `tab_code_alpha5` | nvarchar | 5 | non |  | 6 |
| 4 | `tab_code_numeric6` | int | 10 | non |  | 4 |
| 5 | `tab_classe` | nvarchar | 6 | non |  | 4 |
| 6 | `tab_valeur_numerique` | float | 53 | non |  | 1 |
| 7 | `tab_libelle20` | nvarchar | 20 | non |  | 6 |
| 8 | `tab_libelle10_upper` | nvarchar | 10 | non |  | 1 |
| 9 | `tab_code_droit_modif` | nvarchar | 1 | non |  | 2 |
| 10 | `tab_compte` | int | 10 | non |  | 6 |

## Valeurs distinctes

### `tab_nom_table` (1 valeurs)

```
$MOP
```

### `tab_code_alpha5` (6 valeurs)

```
AMEX, CASH, CCAU, CHQ, OD, VISA
```

### `tab_code_numeric6` (4 valeurs)

```
1, 2, 3, 4
```

### `tab_classe` (4 valeurs)

```
$CARD, $CASH, $PAPER, OD
```

### `tab_valeur_numerique` (1 valeurs)

```
0
```

### `tab_libelle20` (6 valeurs)

```
American express, Autre carte crÃ©dit, ChÃ¨ques Travellers, EspÃ¨ces, OD Club Med Pass, Visa
```

### `tab_code_droit_modif` (2 valeurs)

```
, O
```

### `tab_compte` (6 valeurs)

```
411111, 511100, 511310, 511320, 511330, 532188
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_moyen_paiement_IDX_3 | NONCLUSTERED | oui | tab_nom_table, tab_code_numeric6, tab_code_alpha5 |
| caisse_ref_moyen_paiement_IDX_1 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_alpha5 |
| caisse_ref_moyen_paiement_IDX_2 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_numeric6 |

