# checkout_odyssey

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 11 |
| Clef primaire | CHK_ID |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `CHK_ID` | bigint | 19 | non | PK | 7 |
| 2 | `CHK_STAYID` | bigint | 19 | oui |  | 5 |
| 3 | `CHK_AMOUNT` | decimal | 16,4 | oui |  | 6 |
| 4 | `CHK_MOP_CODE` | char | 8 | oui |  | 2 |
| 5 | `CHK_USR_LOGIN` | char | 8 | oui |  | 2 |
| 6 | `CHK_ID_TRANSACTION` | nvarchar | 32 | oui |  | 1 |
| 7 | `CHK_ID_ACCEPTATION` | nvarchar | 32 | oui |  | 1 |
| 8 | `CHK_TOKEN_ID` | nvarchar | 32 | oui |  | 1 |
| 9 | `CHK_CURRENCY` | char | 3 | oui |  | 1 |
| 10 | `CHK_RATE` | decimal | 16,6 | oui |  | 1 |
| 11 | `CHK_ODYSSEY_ID` | nvarchar | 100 | oui |  | 6 |

## Valeurs distinctes

### `CHK_ID` (7 valeurs)

```
21, 22, 23, 24, 25, 26, 27
```

### `CHK_STAYID` (5 valeurs)

```
1521285901, 1840838000, 2260948300, 2291638000, 627195501
```

### `CHK_AMOUNT` (6 valeurs)

```
10800.0000, 180.0000, 19152.7500, 270.0000, 27790.0000, 29110.0000
```

### `CHK_MOP_CODE` (2 valeurs)

```
CASH    , VISA    
```

### `CHK_USR_LOGIN` (2 valeurs)

```
ARKON   , DOREEN  
```

### `CHK_CURRENCY` (1 valeurs)

```
THB
```

### `CHK_RATE` (1 valeurs)

```
1.000000
```

### `CHK_ODYSSEY_ID` (6 valeurs)

```
1521285901_NTivnAIaePRxsmSpbJQ44, 1840838000_3QOOrAbnN0GZ_wlf5HDBb, 1840838000_VY9zdAcRJArDf4syWB_kC, 2260948300_D88il_qb31Uh5GynPswdX, 2291638000_JRwCzQyrWpk6FnZvvgihx, 627195501_h_qy_rJIMOdWuDOFgx7xu
```

