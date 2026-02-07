# taxe_sejour_histo

**Nom logique Magic** : `taxe_sejour_histo`

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_application` | char | 8 | non |  | 1 |
| 2 | `prix_taxe` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `date_application` (1 valeurs)

```
20221129
```

### `prix_taxe` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taxe_sejour_histo_idx_1 | NONCLUSTERED | oui | date_application, prix_taxe |

