# caisse_eledetail

| Info | Valeur |
|------|--------|
| Lignes | 96 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `langue` | nvarchar | 3 | non |  | 2 |
| 2 | `sessionquandtableau` | nvarchar | 1 | non |  | 5 |
| 3 | `code` | nvarchar | 1 | non |  | 18 |
| 4 | `libelle` | nvarchar | 32 | non |  | 54 |
| 5 | `ordre_edition` | nvarchar | 2 | non |  | 25 |

## Valeurs distinctes

### `langue` (2 valeurs)

```
ANG, FRA
```

### `sessionquandtableau` (5 valeurs)

```
F, O, Q, S, T
```

### `code` (18 valeurs)

```
A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, S, V
```

### `ordre_edition` (25 valeurs)

```
, 0, 01, 02, 03, 04, 05, 06, 07, 08, 09, 1, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 9, 90
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_eledetail_IDX_2 | NONCLUSTERED | non | langue, sessionquandtableau, ordre_edition |
| caisse_eledetail_IDX_1 | NONCLUSTERED | oui | langue, sessionquandtableau, code |

