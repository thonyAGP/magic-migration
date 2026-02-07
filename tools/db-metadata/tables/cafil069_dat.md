# cafil069_dat

| Info | Valeur |
|------|--------|
| Lignes | 26 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gar_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `gar_code_num_` | int | 10 | non |  | 6 |
| 3 | `gar_code_garantie` | nvarchar | 5 | non |  | 7 |
| 4 | `gar_code_classe` | nvarchar | 6 | non |  | 4 |
| 5 | `gar_libelle` | nvarchar | 20 | non |  | 8 |
| 6 | `gar_montant` | float | 53 | non |  | 1 |
| 7 | `gar_code_modif_` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `gar_societe` (5 valeurs)

```
A, B, C, D, G
```

### `gar_code_num_` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `gar_code_garantie` (7 valeurs)

```
AMEX, CASH, CCAU, CHQ, CLUB, TRVL, VISA
```

### `gar_code_classe` (4 valeurs)

```
$CARD, $CASH, $PAPER, PERS
```

### `gar_libelle` (8 valeurs)

```
American Express, Autorisation Village, Autres Carte Credit, DepÃ´t Cheque/Travell, DÃ©pÃ´t Cheque/Travell, DÃ©pÃ´t en CASH, DÃ©pÃ´t en travellers, VISA
```

### `gar_montant` (1 valeurs)

```
0
```

### `gar_code_modif_` (2 valeurs)

```
, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil069_dat_IDX_1 | NONCLUSTERED | oui | gar_societe, gar_code_num_ |

