# evenement

**Nom logique Magic** : `evenement`

| Info | Valeur |
|------|--------|
| Lignes | 26 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `evt_rang` | int | 10 | non |  | 26 |
| 2 | `evt_titre_ecran` | nvarchar | 10 | non |  | 7 |
| 3 | `evt_bouton` | nvarchar | 25 | non |  | 23 |
| 4 | `evt_public_prog` | nvarchar | 25 | non |  | 22 |
| 5 | `evt_droit` | nvarchar | 2 | non |  | 8 |

## Valeurs distinctes

### `evt_rang` (26 valeurs)

```
10, 100, 102, 105, 110, 115, 120, 125, 130, 135, 140, 145, 15, 150, 155, 160, 165, 20, 25, 30, 35, 5, 75, 80, 90, 95
```

### `evt_titre_ecran` (7 valeurs)

```
ACCOUNT, BLOCK, CLIENT, HOME, RES, ROOM, ROOM_INV_S
```

### `evt_bouton` (23 valeurs)

```
ACCOUNT SETTINGS, ASSIGN, BLOCK, CHANGE ROOM STATUS, CHECK IN, CHECK OUT, CLEAR, EXPORT LIST, IDENTITY, MANAGE FILIATIONS, MESSAGE, PHONE LINE, PRINT LIST, PRINT STATEMENT, RE ASSIGN, RE-ASSIGN, RESERVE, ROOM INVENTORY SEARCH, SALES, SCAN CM PASS, SEARCH, STAY ACTIVITY, VALIDATE
```

### `evt_public_prog` (22 valeurs)

```
AFFECTER, BLOCK, CHECK OUT, EXPORT LIST, IDENTITY, LIBERER, MANAGE_FILIATION, MESSAGE, OPEN_CLOSE_PHONE_LINE, PRINT LIST, PRINT STATEMENT, REAFFECTER, RESERVE, ROOM INVENTORY SEARCH, SALES, SCAN_CM_PASS, SEARCH_ROOM, STATUER, STAY ACTIVITY, VALID_BLOCK, VALID_RES, WORKFLOW
```

### `evt_droit` (8 valeurs)

```
, 10, 12, 19, 23, 24, 25, AD
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| evenement_IDX_1 | NONCLUSTERED | oui | evt_rang |

