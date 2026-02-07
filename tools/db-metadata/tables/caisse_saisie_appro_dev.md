# caisse_saisie_appro_dev

| Info | Valeur |
|------|--------|
| Lignes | 17316 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 74 |
| 2 | `code_devise` | nvarchar | 3 | non |  | 15 |
| 3 | `mode_paiement` | nvarchar | 4 | non |  | 4 |
| 4 | `quand` | nvarchar | 1 | non |  | 3 |
| 5 | `type` | nvarchar | 1 | non |  | 8 |
| 6 | `quantite` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `code_devise` (15 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD, ZAR
```

### `mode_paiement` (4 valeurs)

```
ALIP, CASH, UNIO, WECH
```

### `quand` (3 valeurs)

```
F, O, P
```

### `type` (8 valeurs)

```
A, C, D, F, I, K, L, V
```

### `quantite` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_saisie_appro_dev_IDX_1 | NONCLUSTERED | oui | utilisateur, code_devise, mode_paiement, quand, type |

