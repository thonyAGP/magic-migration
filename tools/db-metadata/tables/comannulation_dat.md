# comannulation_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `nbre_de_jours` | int | 10 | non |  | 4 |
| 2 | `taux` | float | 53 | non |  | 2 |

## Valeurs distinctes

### `nbre_de_jours` (4 valeurs)

```
0, 1, 2, 3
```

### `taux` (2 valeurs)

```
0, 50
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| comannulation_dat_IDX_1 | NONCLUSTERED | oui | nbre_de_jours |

