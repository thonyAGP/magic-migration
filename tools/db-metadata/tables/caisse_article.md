# caisse_article

| Info | Valeur |
|------|--------|
| Lignes | 1480 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 74 |
| 2 | `quand` | nvarchar | 1 | non |  | 3 |
| 3 | `quoi` | nvarchar | 1 | non |  | 2 |
| 4 | `ordre` | int | 10 | non |  | 4 |
| 5 | `type` | nvarchar | 3 | non |  | 1 |
| 6 | `libelle` | nvarchar | 16 | non |  | 4 |
| 7 | `prixunitaire` | float | 53 | non |  | 4 |
| 8 | `quantite` | int | 10 | non |  | 7 |
| 9 | `montant` | float | 53 | non |  | 11 |
| 10 | `code_article` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `quand` (3 valeurs)

```
F, O, P
```

### `quoi` (2 valeurs)

```
A, D
```

### `ordre` (4 valeurs)

```
1, 2, 3, 4
```

### `type` (1 valeurs)

```
ART
```

### `libelle` (4 valeurs)

```
1D PREMIUM, 1D SILVER, 1W SILVER M, 7D PREMIUM
```

### `prixunitaire` (4 valeurs)

```
105, 1300, 210, 650
```

### `quantite` (7 valeurs)

```
0, 1, 2, 3, 4, 5, 6
```

### `montant` (11 valeurs)

```
0, 1050, 1260, 210, 2600, 3250, 3900, 420, 5200, 6500, 7800
```

### `code_article` (4 valeurs)

```
553, 554, 555, 557
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_article_IDX_1 | NONCLUSTERED | oui | utilisateur, ordre, quand, quoi |
| caisse_article_IDX_2 | NONCLUSTERED | oui | utilisateur, quand, quoi, ordre |

