# cafil037_dat

| Info | Valeur |
|------|--------|
| Lignes | 240 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ldk_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ldk_date_comptable` | char | 8 | non |  | 43 |
| 3 | `ldk_code_devise` | nvarchar | 3 | non |  | 14 |
| 4 | `ldk_moyen_paiement` | nvarchar | 4 | non |  | 1 |
| 5 | `ldk_quantite` | float | 53 | non |  | 166 |
| 6 | `ldk_top_validation` | nvarchar | 1 | non |  | 1 |
| 7 | `ldk_date_de_sortie` | char | 8 | non |  | 43 |
| 8 | `ldk_heure_de_sortie` | char | 6 | non |  | 55 |

## Valeurs distinctes

### `ldk_societe` (1 valeurs)

```
C
```

### `ldk_date_comptable` (43 valeurs)

```
20220407, 20220512, 20220601, 20220707, 20220711, 20220804, 20220830, 20220909, 20220930, 20221110, 20221116, 20221122, 20221129, 20221214, 20221231, 20230115, 20230128, 20230131, 20230214, 20230223, 20230228, 20230308, 20230330, 20230412, 20230425, 20230510, 20230523, 20230531, 20230613, 20230619, 20230705, 20230727, 20240113, 20240212, 20240305, 20240310, 20240324, 20240401, 20240515, 20240611, 20240701, 20240713, 20241031
```

### `ldk_code_devise` (14 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD
```

### `ldk_moyen_paiement` (1 valeurs)

```
CASH
```

### `ldk_top_validation` (1 valeurs)

```
O
```

### `ldk_date_de_sortie` (43 valeurs)

```
20220407, 20220512, 20220601, 20220707, 20220711, 20220804, 20220830, 20220909, 20220930, 20221110, 20221116, 20221122, 20221129, 20221214, 20221231, 20230115, 20230128, 20230131, 20230214, 20230223, 20230228, 20230308, 20230330, 20230412, 20230425, 20230510, 20230523, 20230531, 20230613, 20230619, 20230705, 20230727, 20240113, 20240212, 20240305, 20240310, 20240324, 20240401, 20240515, 20240611, 20240701, 20240713, 20241031
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil037_dat_IDX_1 | NONCLUSTERED | oui | ldk_societe, ldk_date_comptable, ldk_code_devise, ldk_moyen_paiement, ldk_date_de_sortie, ldk_heure_de_sortie |

