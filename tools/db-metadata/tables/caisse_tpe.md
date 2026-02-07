# caisse_tpe

| Info | Valeur |
|------|--------|
| Lignes | 280 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `numero` | int | 10 | non |  | 40 |
| 2 | `mop` | nvarchar | 4 | non |  | 7 |
| 3 | `ordre_saisie` | int | 10 | non |  | 7 |
| 4 | `libelle_du_tpe` | nvarchar | 64 | non |  | 227 |

## Valeurs distinctes

### `numero` (40 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 5, 6, 7, 8, 9
```

### `mop` (7 valeurs)

```
ALIP, AMEX, CCAU, UNIO, VISA, WECH, ZZZ
```

### `ordre_saisie` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 99
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_tpe_IDX_2 | NONCLUSTERED | non | numero, ordre_saisie |
| caisse_tpe_IDX_1 | NONCLUSTERED | oui | numero, mop |

