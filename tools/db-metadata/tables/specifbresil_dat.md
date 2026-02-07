# specifbresil_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `bre_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `bre_compte` | int | 10 | non |  | 1 |
| 3 | `bre_filiation` | int | 10 | non |  | 1 |
| 4 | `bre_venant_de` | nvarchar | 18 | non |  | 1 |
| 5 | `bre_allant_a` | nvarchar | 18 | non |  | 1 |
| 6 | `bre_email` | nvarchar | 60 | non |  | 1 |
| 7 | `bre_tel_indic_` | nvarchar | 3 | non |  | 1 |
| 8 | `bre_telephone` | nvarchar | 15 | non |  | 1 |

## Valeurs distinctes

### `bre_societe` (1 valeurs)

```
C
```

### `bre_compte` (1 valeurs)

```
503293
```

### `bre_filiation` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| specifbresil_dat_IDX_1 | NONCLUSTERED | oui | bre_societe, bre_compte, bre_filiation |

