# param_categorie_client_mw

**Nom logique Magic** : `param_categorie_client_mw`

| Info | Valeur |
|------|--------|
| Lignes | 10 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pac_rang` | int | 10 | non |  | 10 |
| 2 | `pac_code` | nvarchar | 10 | non |  | 10 |
| 3 | `pac_libelle_defaut` | nvarchar | 60 | non |  | 10 |
| 4 | `pac_public_prog` | nvarchar | 25 | non |  | 3 |

## Valeurs distinctes

### `pac_rang` (10 valeurs)

```
10, 100, 110, 20, 30, 40, 50, 60, 70, 80
```

### `pac_code` (10 valeurs)

```
AMBASSADOR, CONTRIB, EASYARR, FIDEL, HONEY, PBS, SEMINAR, TOUR, UPGRADE, VILSWITCH
```

### `pac_libelle_defaut` (10 valeurs)

```
AMBASSADOR, CONTRIBUTOR, EASY ARRIVAL, HONEY MOON, PRE BOOKED SERVICES, SEMINAR, SILVER, TOUR, UPGRADE, VILLAGE SWITCH
```

### `pac_public_prog` (3 valeurs)

```
, PBS, TOUR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| param_categorie_client_mw_IDX_1 | NONCLUSTERED | oui | pac_rang |

