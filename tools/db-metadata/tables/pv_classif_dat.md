# pv_classif_dat

| Info | Valeur |
|------|--------|
| Lignes | 32 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `classification_id` | int | 10 | non |  | 29 |
| 2 | `description` | nvarchar | 30 | non |  | 32 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 4 |
| 4 | `equipement_id` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `classification_id` (29 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 3, 4, 5, 6, 7, 8, 9
```

### `description` (32 valeurs)

```
,  0;, 0, Assurance, Batons, Casque, Ch. Confort, Ch. Enf, Ch. Montagne, Ch. Nordique, Ch. Prestige, Ch. Snow ad, Ch. Snow Enf, Kit Snow. Enf, Kit Snow.Perf., Kit Snow.Sport, Mini Ski, Mirco board, Raquette, Services, Ski loisir ad, Ski Nordique, Ski Perf. ad, Ski Perf. Enf, Ski Prestige ad, Ski Sport ad, Ski Sport Enf, Snow. Enf, Snow. Perf, Snow.Sport, Snowblade, Ventes
```

### `pv_service` (4 valeurs)

```
BARD, ESTH, INFI, SKIN
```

### `equipement_id` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_classif_dat_IDX_2 | NONCLUSTERED | oui | pv_service, description, classification_id |
| pv_classif_dat_IDX_1 | NONCLUSTERED | oui | pv_service, classification_id |

