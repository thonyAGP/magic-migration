# tranche_age_taxe

**Nom logique Magic** : `tranche_age_taxe`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tat_age_mini` | int | 10 | non |  | 2 |
| 2 | `tat_age_maxi` | int | 10 | non |  | 2 |
| 3 | `tat_exonere` | bit |  | non |  | 1 |

## Valeurs distinctes

### `tat_age_mini` (2 valeurs)

```
0, 12
```

### `tat_age_maxi` (2 valeurs)

```
11, 150
```

### `tat_exonere` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tranche_age_taxe_IDX_1 | NONCLUSTERED | oui | tat_age_mini, tat_age_maxi |

