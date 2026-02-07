# couchage_village

**Nom logique Magic** : `couchage_village`

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ccv_id` | bigint | 19 | non |  | 3 |
| 2 | `ccv_code_couchage` | nvarchar | 10 | non |  | 3 |
| 3 | `ccv_largeur` | smallint | 5 | non |  | 3 |
| 4 | `ccv_longueur` | smallint | 5 | non |  | 1 |
| 5 | `ccv_age_max` | tinyint | 3 | non |  | 1 |

## Valeurs distinctes

### `ccv_id` (3 valeurs)

```
1, 2, 3
```

### `ccv_code_couchage` (3 valeurs)

```
KING, QUEEN, TWIN
```

### `ccv_largeur` (3 valeurs)

```
100, 150, 200
```

### `ccv_longueur` (1 valeurs)

```
200
```

### `ccv_age_max` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| couchage_village_IDX_2 | NONCLUSTERED | oui | ccv_code_couchage, ccv_id |
| couchage_village_IDX_1 | NONCLUSTERED | oui | ccv_id |

