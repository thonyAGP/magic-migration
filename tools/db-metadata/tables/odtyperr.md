# odtyperr

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_erreur` | int | 10 | non |  | 2 |
| 2 | `libelle` | nvarchar | 30 | non |  | 2 |

## Valeurs distinctes

### `type_erreur` (2 valeurs)

```
1, 2
```

### `libelle` (2 valeurs)

```
Carte en opposition, Carte inconnue
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| odtyperr_IDX_1 | NONCLUSTERED | oui | type_erreur |

