# caisse_devise

| Info | Valeur |
|------|--------|
| Lignes | 19816 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 74 |
| 2 | `code_devise` | nvarchar | 3 | non |  | 16 |
| 3 | `mode_paiement` | nvarchar | 4 | non |  | 12 |
| 4 | `quand` | nvarchar | 1 | non |  | 3 |
| 5 | `type` | nvarchar | 1 | non |  | 8 |
| 6 | `quantite` | float | 53 | non |  | 3 |

## Valeurs distinctes

### `code_devise` (16 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, THB, TWD, USD, ZAR
```

### `mode_paiement` (12 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHQ, OD, UNIO, VADA, VADV, VISA, WECH
```

### `quand` (3 valeurs)

```
F, O, P
```

### `type` (8 valeurs)

```
A, C, D, F, I, K, L, V
```

### `quantite` (3 valeurs)

```
0, 100, 200
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_devise_IDX_1 | NONCLUSTERED | oui | utilisateur, code_devise, mode_paiement, quand, type |

