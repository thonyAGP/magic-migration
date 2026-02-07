# req_profile2_dat

| Info | Valeur |
|------|--------|
| Lignes | 106 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_group` | nvarchar | 20 | non |  | 16 |
| 2 | `code_access_service` | nvarchar | 6 | non |  | 18 |
| 3 | `default_filter__` | bit |  | non |  | 2 |

## Valeurs distinctes

### `code_group` (16 valeurs)

```
ANIM, ANIMATION, CHEF DE VILLAGE, ECONOMAT, HR, INFIRMERIE, INFORMATICIEN, MAINTENANCE, MAITRESSE DE MAISON, MINI CLUB, PLANNING, RECEP, RECEPTION, SECRETAIRE, SPORT, TRAFIC
```

### `code_access_service` (18 valeurs)

```
ANIM, ARTS, BAR, BOUT, COMM, DIVER, ECO, ENFAN, EXCU, FAM, HOUSE, HR, MAINT, OFFI, RECEP, REST, SPA, SPORT
```

### `default_filter__` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_profile2_dat_IDX_1 | NONCLUSTERED | oui | code_group, code_access_service |
| req_profile2_dat_IDX_2 | NONCLUSTERED | non | code_access_service, code_group |

