# caisse_pdc_boutique

| Info | Valeur |
|------|--------|
| Lignes | 1000 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date` | char | 8 | non |  | 756 |
| 2 | `imputation` | float | 53 | non |  | 5 |
| 3 | `sous_imputation` | int | 10 | non |  | 1 |
| 4 | `montant` | float | 53 | non |  | 774 |
| 5 | `libelle` | nvarchar | 30 | non |  | 5 |
| 6 | `date_operation` | char | 8 | non |  | 764 |

## Valeurs distinctes

### `imputation` (5 valeurs)

```
4.6762e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008, 7.0889e+008
```

### `sous_imputation` (1 valeurs)

```
0
```

### `libelle` (5 valeurs)

```
, Autres refacturations, Ventes de marchandises, Ventes de tabac, Ventes de timbre
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_pdc_boutique_IDX_1 | NONCLUSTERED | oui | date, imputation, sous_imputation, date_operation |

