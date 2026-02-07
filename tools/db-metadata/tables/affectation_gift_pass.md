# affectation_gift_pass

**Nom logique Magic** : `affectation_gift_pass`

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `agp_type` | nvarchar | 3 | non |  | 2 |
| 2 | `agp_code` | nvarchar | 1 | non |  | 5 |
| 3 | `agp_valeur` | float | 53 | non |  | 3 |
| 4 | `nb_nuits_min` | int | 10 | non |  | 1 |
| 5 | `nb_nuits_max` | int | 10 | non |  | 1 |
| 6 | `agp_repas_arrivee` | bit |  | non |  | 1 |

## Valeurs distinctes

### `agp_type` (2 valeurs)

```
FID, VIP
```

### `agp_code` (5 valeurs)

```
G, P, S, T, V
```

### `agp_valeur` (3 valeurs)

```
100, 150, 50
```

### `nb_nuits_min` (1 valeurs)

```
0
```

### `nb_nuits_max` (1 valeurs)

```
0
```

### `agp_repas_arrivee` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| affectation_gift_pass_IDX_1 | NONCLUSTERED | oui | agp_type, agp_code, nb_nuits_min, nb_nuits_max |

