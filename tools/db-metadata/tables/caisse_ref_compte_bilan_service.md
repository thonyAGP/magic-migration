# caisse_ref_compte_bilan_service

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service_village` | nvarchar | 4 | non |  | 2 |
| 2 | `compte_bilan` | int | 10 | non |  | 7 |

## Valeurs distinctes

### `service_village` (2 valeurs)

```
CAIS, GEST
```

### `compte_bilan` (7 valeurs)

```
182200, 183000, 421000, 425200, 425400, 472700, 580100
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_compte_bilan_service_IDX_1 | NONCLUSTERED | oui | service_village, compte_bilan |

