# log_pilotage_hebdo

**Nom logique Magic** : `log_pilotage_hebdo`

| Info | Valeur |
|------|--------|
| Lignes | 41 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lph_date_envoi` | char | 8 | non |  | 41 |
| 2 | `lph_type_exp` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `lph_date_envoi` (41 valeurs)

```
20170131, 20170228, 20170331, 20170430, 20170531, 20170630, 20170731, 20170831, 20170930, 20171031, 20171130, 20171231, 20180131, 20180228, 20180331, 20180407, 20180414, 20180421, 20180428, 20180430, 20180505, 20180512, 20180519, 20180526, 20180531, 20180609, 20180616, 20180623, 20180630, 20180707, 20180714, 20180721, 20180728, 20180731, 20180804, 20180811, 20180818, 20180825, 20180831, 20180930, 20181031
```

### `lph_type_exp` (2 valeurs)

```
H, M
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_pilotage_hebdo_IDX_1 | NONCLUSTERED | oui | lph_date_envoi, lph_type_exp |

