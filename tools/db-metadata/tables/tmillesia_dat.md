# tmillesia_dat

| Info | Valeur |
|------|--------|
| Lignes | 44 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 3 | non |  | 2 |
| 2 | `code` | nvarchar | 1 | non |  | 22 |
| 3 | `libelle` | nvarchar | 25 | non |  | 39 |
| 4 | `couleur` | int | 10 | non |  | 7 |
| 5 | `priorite` | int | 10 | non |  | 3 |
| 6 | `code_donateur` | nvarchar | 1 | oui |  | 0 |

## Valeurs distinctes

### `code_langue` (2 valeurs)

```
ANG, FRA
```

### `code` (22 valeurs)

```
A, B, C, D, E, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W
```

### `libelle` (39 valeurs)

```
Act. TURQUOISE report vil, Action GOLD report vill., Action SILVER report vill, Action TURQUOISE, action. GOLD, Action. SILVER, Actionnaire report vill., Actionnaire VIP, Actionnaires, Agent de voyage, GO Bureau, GO Office, GOLD, GOLD postponed, GOLD report vill., Indirect sales, New GM, New GM postponed, Nouveau GM, Nouveau GM report vill., Share GOLD postponed, Share SILVER, Share SILVER posponed, Share TURQUOISE, Share TURQUOISE postponed, Shareholder, Shareholder GOLD, Shareholder posponed, Shareholder VIP, SILVER, SILVER postponed, SILVER report vill., Travel Agent, TURQUOISE, TURQUOISE postponed, TURQUOISE report vill., VIP, VIP postponed, VIP report vill.
```

### `couleur` (7 valeurs)

```
1, 141, 146, 152, 190, 191, 6
```

### `priorite` (3 valeurs)

```
0, 1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tmillesia_dat_IDX_1 | NONCLUSTERED | oui | code_langue, code |

