# pv_tva_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tva_code` | float | 53 | non |  | 2 |
| 2 | `tva_description` | nvarchar | 30 | non |  | 2 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 1 |
| 4 | `tva_taux_reduit` | bit |  | non |  | 1 |

## Valeurs distinctes

### `tva_code` (2 valeurs)

```
0, 7
```

### `tva_description` (2 valeurs)

```
0 % VAT, 7% VAT
```

### `tva_taux_reduit` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_tva_dat_IDX_1 | NONCLUSTERED | oui | pv_service, tva_code |

