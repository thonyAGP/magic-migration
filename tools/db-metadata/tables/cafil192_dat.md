# cafil192_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `nvp_code_village` | nvarchar | 6 | non |  | 3 |
| 2 | `nvp_code_pme` | int | 10 | non |  | 3 |

## Valeurs distinctes

### `nvp_code_village` (3 valeurs)

```
AHUC, POMC, RSOC
```

### `nvp_code_pme` (3 valeurs)

```
33, 34, 35
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil192_dat_IDX_1 | NONCLUSTERED | oui | nvp_code_village |

