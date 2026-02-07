# task_mw

**Nom logique Magic** : `task_mw`

| Info | Valeur |
|------|--------|
| Lignes | 30 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tas_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tas_compte_client` | int | 10 | non |  | 2 |
| 3 | `tas_filiation` | int | 10 | non |  | 5 |
| 4 | `tas_code_action` | nvarchar | 10 | non |  | 10 |
| 5 | `tas_commentaire` | nvarchar | 250 | non |  | 8 |
| 6 | `tas_effectue` | bit |  | non |  | 2 |
| 7 | `tas_date` | char | 8 | non |  | 3 |
| 8 | `tas_time` | char | 6 | non |  | 6 |
| 9 | `tas_user` | nvarchar | 8 | non |  | 3 |

## Valeurs distinctes

### `tas_societe` (1 valeurs)

```
C
```

### `tas_compte_client` (2 valeurs)

```
485789, 491027
```

### `tas_filiation` (5 valeurs)

```
0, 1, 2, 3, 4
```

### `tas_code_action` (10 valeurs)

```
ACCOUNT, ECI, EMAIL, ENCODECMP, FILIATION, IDENTITY, OPENLINE, PHONE, POLICE, VALIDATE
```

### `tas_commentaire` (8 valeurs)

```
, CLUB, Complete, EASY CHECK OUT DEACTIVATED, Identity verified, NÂ° of Guests validated  Out of 5, NÂ° of Guests validated 1 Out of 1, NÂ° of Pass encoded    0
```

### `tas_effectue` (2 valeurs)

```
0, 1
```

### `tas_date` (3 valeurs)

```
00000000, 20180302, 20180331
```

### `tas_time` (6 valeurs)

```
000000, 095955, 100002, 100032, 215946, 215947
```

### `tas_user` (3 valeurs)

```
, PATRICE, ZAKI
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| task_mw_IDX_1 | NONCLUSTERED | oui | tas_societe, tas_compte_client, tas_filiation, tas_code_action |

