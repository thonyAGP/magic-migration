# pv_sellingunit_dat

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `SLU_Unit` | nvarchar | 3 | non |  | 6 |
| 2 | `SLU_Description` | nvarchar | 20 | non |  | 6 |
| 3 | `SLU_PV_Service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `SLU_Unit` (6 valeurs)

```
BTL, CL, GLA, KG, PC, TOT
```

### `SLU_Description` (6 valeurs)

```
1 SHOT, BOTTLE, Centiliter, GLASS, Kilogram, Piece
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_sellingunit_dat_IDX_1 | NONCLUSTERED | oui | SLU_PV_Service, SLU_Unit |

