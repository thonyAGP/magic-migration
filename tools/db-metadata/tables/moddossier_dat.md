# moddossier_dat

| Info | Valeur |
|------|--------|
| Lignes | 234 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 10 | non |  | 1 |
| 2 | `dossier` | int | 10 | non |  | 204 |
| 3 | `date_de_la_modif` | char | 8 | non |  | 29 |
| 4 | `modif_effectue` | bit |  | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (1 valeurs)

```
PLANNING
```

### `date_de_la_modif` (29 valeurs)

```
20250324, 20250410, 20250415, 20250508, 20250518, 20250722, 20250910, 20250915, 20250924, 20251006, 20251015, 20251023, 20251031, 20251125, 20251201, 20251203, 20251205, 20251208, 20251209, 20251210, 20251215, 20251216, 20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223
```

### `modif_effectue` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| moddossier_dat_IDX_1 | NONCLUSTERED | oui | utilisateur, dossier, date_de_la_modif |
| moddossier_dat_IDX_2 | NONCLUSTERED | non | utilisateur, modif_effectue |
| moddossier_dat_IDX_3 | NONCLUSTERED | non | date_de_la_modif |

