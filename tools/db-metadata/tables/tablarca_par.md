# tablarca_par

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tac_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tac_numero_article` | int | 10 | non |  | 5 |
| 3 | `tac_libelle_article` | nvarchar | 30 | non |  | 5 |

## Valeurs distinctes

### `tac_societe` (1 valeurs)

```
C
```

### `tac_numero_article` (5 valeurs)

```
1, 2, 3, 4, 5
```

### `tac_libelle_article` (5 valeurs)

```
carte, clÃ©, jeux, serviettes, tÃ©lÃ©commande
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tablarca_par_IDX_1 | NONCLUSTERED | oui | tac_societe, tac_numero_article |

