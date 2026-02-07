# ticket_odyssey

| Info | Valeur |
|------|--------|
| Lignes | 68 |
| Colonnes | 45 |
| Clef primaire | TIK_ID |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `TIK_ID` | bigint | 19 | non | PK | 68 |
| 2 | `PRD_ID` | bigint | 19 | oui |  | 6 |
| 3 | `OPR_DEBIT` | bit |  | oui |  | 1 |
| 4 | `STAYID` | bigint | 19 | oui |  | 10 |
| 5 | `OPR_QUANTITY` | float | 53 | oui |  | 2 |
| 6 | `OPR_D_CONSUMPTION` | date |  | oui |  | 2 |
| 7 | `OPR_NET_AMOUNT` | decimal | 16,4 | oui |  | 9 |
| 8 | `OPR_DISCOUNT_AMOUNT` | decimal | 16,4 | oui |  | 1 |
| 9 | `DSC_CODE` | nvarchar | 15 | oui |  | 1 |
| 10 | `MOP_CODE` | char | 8 | oui |  | 2 |
| 11 | `USR_LOGIN` | char | 8 | oui |  | 4 |
| 12 | `ID_TRANSACTION` | nvarchar | 32 | oui |  | 0 |
| 13 | `ID_ACCEPTATION` | nvarchar | 32 | oui |  | 0 |
| 14 | `TOKEN_ID` | nvarchar | 32 | oui |  | 0 |
| 15 | `TKE_ID` | bigint | 19 | oui |  | 0 |
| 16 | `OPR_ID` | bigint | 19 | oui |  | 0 |
| 17 | `OPR_ID_TO_CANCEL` | bigint | 19 | oui |  | 0 |
| 18 | `OPC_AMOUNT` | decimal | 16,4 | oui |  | 0 |
| 19 | `ODYSSEY_ID` | nvarchar | 100 | oui |  | 10 |
| 20 | `PCL_SALE_CODE` | nvarchar | 1 | oui |  | 1 |
| 21 | `ACD_CODE` | nvarchar | 6 | oui |  | 1 |
| 22 | `OPR_D_END_STAY` | date |  | oui |  | 1 |
| 23 | `NBR_ID` | int | 10 | oui |  | 1 |
| 24 | `OPR_COMMENT` | nvarchar | 200 | oui |  | 2 |
| 25 | `TRF_SENS` | nvarchar | 2 | oui |  | 1 |
| 26 | `TRF_DT_ALLER` | datetime |  | oui |  | 1 |
| 27 | `TRF_TYPE_ENDROIT_ALLER` | nvarchar | 2 | oui |  | 1 |
| 28 | `TRF_CODE_ENDROIT_ALLER` | nvarchar | 6 | oui |  | 1 |
| 29 | `TRF_VOL_ALLER` | nvarchar | 10 | oui |  | 1 |
| 30 | `TRF_COMPAGNIE_ALLER` | nvarchar | 9 | oui |  | 1 |
| 31 | `TRF_COMMENT_ALLER` | nvarchar | 30 | oui |  | 1 |
| 32 | `TRF_DT_RETOUR` | datetime |  | oui |  | 0 |
| 33 | `TRF_TYPE_ENDROIT_RETOUR` | nvarchar | 2 | oui |  | 0 |
| 34 | `TRF_CODE_ENDROIT_RETOUR` | nvarchar | 6 | oui |  | 0 |
| 35 | `TRF_VOL_RETOUR` | nvarchar | 10 | oui |  | 0 |
| 36 | `TRF_COMPAGNIE_RETOUR` | nvarchar | 9 | oui |  | 0 |
| 37 | `TRF_COMMENT_RETOUR` | nvarchar | 30 | oui |  | 0 |
| 38 | `SA_TITLE` | nvarchar | 2 | oui |  | 1 |
| 39 | `SA_NAME` | nvarchar | 30 | oui |  | 1 |
| 40 | `SA_FIRST_NAME` | nvarchar | 10 | oui |  | 1 |
| 41 | `SA_STREET_NUMBER` | nvarchar | 10 | oui |  | 1 |
| 42 | `SA_STREET_NAME` | nvarchar | 30 | oui |  | 1 |
| 43 | `SA_ADDR2` | nvarchar | 35 | oui |  | 1 |
| 44 | `SA_ZIP_CODE` | nvarchar | 10 | oui |  | 1 |
| 45 | `SA_CITY` | nvarchar | 30 | oui |  | 1 |

## Valeurs distinctes

### `PRD_ID` (6 valeurs)

```
10003, 1771, 1773, 1801, 2900, 800
```

### `OPR_DEBIT` (1 valeurs)

```
1
```

### `STAYID` (10 valeurs)

```
1578344401, 1713428600, 2134178700, 2234167600, 2278071200, 2278071202, 2320172311, 2344883003, 2346251701, 2354395300
```

### `OPR_QUANTITY` (2 valeurs)

```
1, 2
```

### `OPR_D_CONSUMPTION` (2 valeurs)

```
2025-05-12, 2025-11-22
```

### `OPR_NET_AMOUNT` (9 valeurs)

```
1300.0000, 1390.0000, 1800.0000, 225.0000, 25620.0000, 2600.0000, 4000.0000, 500.0000, 800.0000
```

### `OPR_DISCOUNT_AMOUNT` (1 valeurs)

```
0.0000
```

### `MOP_CODE` (2 valeurs)

```
ALIP    , OD      
```

### `USR_LOGIN` (4 valeurs)

```
ARKON   , BEAM    , DOREEN  , GIFT    
```

### `ODYSSEY_ID` (10 valeurs)

```
ARKON2134178700OTHER, ARKON2354395300ALIP1766319756552, BEAM2234167600VRL, BEAM2320172311OTHER, BEAM2344883003VRL, DOREEN1713428600OTHER, DOREEN2278071200OTHER, DOREEN2278071202OTHER, DOREEN2346251701VRL, GIFT1578344401VSL
```

### `PCL_SALE_CODE` (1 valeurs)

```
G
```

### `ACD_CODE` (1 valeurs)

```
C2A+
```

### `OPR_D_END_STAY` (1 valeurs)

```
2025-06-12
```

### `NBR_ID` (1 valeurs)

```
5
```

### `OPR_COMMENT` (2 valeurs)

```
, 410136981/EXT/ 2AD/ 25% 
```

### `TRF_SENS` (1 valeurs)

```
A
```

### `TRF_DT_ALLER` (1 valeurs)

```
dÃ©c 22 2025 10:30AM
```

### `TRF_TYPE_ENDROIT_ALLER` (1 valeurs)

```
PL
```

### `TRF_CODE_ENDROIT_ALLER` (1 valeurs)

```
HKT
```

### `TRF_VOL_ALLER` (1 valeurs)

```
0540
```

### `TRF_COMPAGNIE_ALLER` (1 valeurs)

```
-
```

### `TRF_COMMENT_ALLER` (1 valeurs)

```
TSF OUT
```

### `SA_TITLE` (1 valeurs)

```
Mr
```

