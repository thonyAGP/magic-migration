# excuann_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ean_type` | nvarchar | 1 | non |  | 1 |
| 2 | `ean_code` | int | 10 | non |  | 1 |
| 3 | `ean_transport` | nvarchar | 120 | non |  | 1 |
| 4 | `ean_programme` | nvarchar | 240 | non |  | 1 |
| 5 | `ean_ne_pas_oublier` | nvarchar | 80 | non |  | 1 |
| 6 | `ean_materiel_fourni` | nvarchar | 80 | non |  | 1 |
| 7 | `ean_aptitudes` | nvarchar | 80 | non |  | 1 |
| 8 | `ean_annulation_si` | nvarchar | 40 | non |  | 1 |
| 9 | `ean_langues` | nvarchar | 20 | non |  | 1 |

## Valeurs distinctes

### `ean_type` (1 valeurs)

```
1
```

### `ean_code` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excuann_dat_IDX_1 | NONCLUSTERED | oui | ean_type, ean_code |

