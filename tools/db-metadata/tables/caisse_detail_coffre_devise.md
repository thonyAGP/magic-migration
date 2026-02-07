# caisse_detail_coffre_devise

| Info | Valeur |
|------|--------|
| Lignes | 1596 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 320 |
| 3 | `devise` | nvarchar | 3 | non |  | 14 |
| 4 | `moyen_de_paiement` | nvarchar | 4 | non |  | 1 |
| 5 | `quantite` | float | 53 | non |  | 204 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `devise` (14 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD
```

### `moyen_de_paiement` (1 valeurs)

```
CASH
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_detail_coffre_devise_IDX_1 | NONCLUSTERED | oui | societe, date_comptable, devise, moyen_de_paiement |

