# listhand_dat

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | nvarchar | 2 | non |  | 7 |
| 2 | `libelle` | nvarchar | 40 | non |  | 7 |

## Valeurs distinctes

### `code` (7 valeurs)

```
M, O, OM, OV, V, VM, XX
```

### `libelle` (7 valeurs)

```
MOBILITE REDUITE, OUIE, OUIE + MOBILITE REDUITE, OUIE + VISION, OUIE +VISION + MOBILITE REDUITE, VISION, VISION + MOBILITE REDUITE
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| listhand_dat_IDX_1 | NONCLUSTERED | oui | code |

