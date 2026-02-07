# caisse_solde_fdr

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_comptable` | char | 8 | non |  | 1564 |
| 2 | `montant_fdr` | float | 53 | non |  | 2 |

## Valeurs distinctes

### `montant_fdr` (2 valeurs)

```
0, -267340
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_solde_fdr_IDX_1 | NONCLUSTERED | oui | date_comptable |

