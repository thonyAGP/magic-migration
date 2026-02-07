# caisse_coffre_article

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 3 |
| 2 | `quand` | nvarchar | 1 | non |  | 1 |
| 3 | `quoi` | nvarchar | 1 | non |  | 1 |
| 4 | `ordre` | int | 10 | non |  | 4 |
| 5 | `type` | nvarchar | 3 | non |  | 1 |
| 6 | `libelle` | nvarchar | 16 | non |  | 4 |
| 7 | `prixunitaire` | float | 53 | non |  | 4 |
| 8 | `quantite` | int | 10 | non |  | 4 |
| 9 | `montant` | float | 53 | non |  | 7 |
| 10 | `code_article` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `utilisateur` (3 valeurs)

```
ASSTFAM, FAM, WELCMGR
```

### `quoi` (1 valeurs)

```
A
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

### `quantite` (4 valeurs)

```
0, 10, 3, 400
```

### `montant` (7 valeurs)

```
0, 13000, 260000, 42000, 520000, 630, 84000
```

### `code_article` (4 valeurs)

```
553, 554, 555, 557
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_coffre_article_IDX_1 | NONCLUSTERED | oui | utilisateur, ordre, quand, quoi |
| caisse_coffre_article_IDX_2 | NONCLUSTERED | oui | utilisateur, quand, quoi, ordre |

