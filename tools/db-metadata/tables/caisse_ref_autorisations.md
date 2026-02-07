# caisse_ref_autorisations

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `moyen_de_paiement` | nvarchar | 4 | non |  | 6 |
| 2 | `versement` | nvarchar | 1 | non |  | 2 |
| 3 | `solde` | nvarchar | 1 | non |  | 2 |
| 4 | `ventes` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `moyen_de_paiement` (6 valeurs)

```
AMEX, CASH, CCAU, CHQ, OD, VISA
```

### `versement` (2 valeurs)

```
N, O
```

### `solde` (2 valeurs)

```
N, O
```

### `ventes` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_autorisations_IDX_1 | NONCLUSTERED | oui | moyen_de_paiement |

