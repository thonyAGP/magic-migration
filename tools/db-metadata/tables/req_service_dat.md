# req_service_dat

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `serv_code` | nvarchar | 6 | non |  | 13 |
| 2 | `serv_description` | nvarchar | 20 | non |  | 13 |

## Valeurs distinctes

### `serv_code` (13 valeurs)

```
ANIM, BAR, BOUT, DIVER, ECO, EXC, HOUSE, MAINT, MC, OFFI, RECEP, RESTO, SPORT
```

### `serv_description` (13 valeurs)

```
Administration, Animation, Bar, Boutique, Discovery, Housekeeping, Kitchen, Maintenance, MiniClub, Others dept, Reception, Restaurant, Sports
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_service_dat_IDX_2 | NONCLUSTERED | oui | serv_description |
| req_service_dat_IDX_1 | NONCLUSTERED | oui | serv_code |

