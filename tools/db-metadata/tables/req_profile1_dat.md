# req_profile1_dat

| Info | Valeur |
|------|--------|
| Lignes | 22 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `serv_code_groupe` | nvarchar | 20 | non |  | 13 |
| 2 | `serv_request_type` | nvarchar | 2 | non |  | 3 |
| 3 | `default_filter__` | bit |  | non |  | 2 |

## Valeurs distinctes

### `serv_code_groupe` (13 valeurs)

```
ANIMATION, CHEF DE VILLAGE, ECONOMAT, INFIRMERIE, INFORMATICIEN, MAINTENANCE, MAITRESSE DE MAISON, MINI CLUB, PLANNING, RECEPTION, SECRETAIRE, SPORT, TRAFIC
```

### `serv_request_type` (3 valeurs)

```
GM, GO, WO
```

### `default_filter__` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_profile1_dat_IDX_2 | NONCLUSTERED | non | serv_request_type |
| req_profile1_dat_IDX_1 | NONCLUSTERED | oui | serv_code_groupe, serv_request_type |

