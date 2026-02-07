# barcreditconso

**Nom logique Magic** : `barcreditconso`

| Info | Valeur |
|------|--------|
| Lignes | 1391 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `BCC_BarId` | nvarchar | 5 | non |  | 2 |
| 2 | `BCC_PackageOut` | float | 53 | non |  | 1391 |
| 3 | `BCC_Amount` | float | 53 | non |  | 66 |
| 4 | `BCC_CreditConso` | float | 53 | non |  | 75 |
| 5 | `BCC_PosteId` | nvarchar | 3 | non |  | 10 |

## Valeurs distinctes

### `BCC_BarId` (2 valeurs)

```
BARD, REST
```

### `BCC_PosteId` (10 valeurs)

```
001, 002, 003, 004, 005, 006, 009, 500, 801, 942
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| barcreditconso_IDX_1 | NONCLUSTERED | oui | BCC_BarId, BCC_PackageOut |

