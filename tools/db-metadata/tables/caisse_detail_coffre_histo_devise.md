# caisse_detail_coffre_histo_devise

| Info | Valeur |
|------|--------|
| Lignes | 3021 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 756 |
| 2 | `devise` | nvarchar | 3 | non |  | 14 |
| 3 | `moyen_de_paiement` | nvarchar | 4 | non |  | 1 |
| 4 | `quantite` | float | 53 | non |  | 208 |

## Valeurs distinctes

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
| caisse_detail_coffre_histo_devise_IDX_1 | NONCLUSTERED | oui | chrono, devise, moyen_de_paiement |

