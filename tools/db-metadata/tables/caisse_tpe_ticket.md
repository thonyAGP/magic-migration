# caisse_tpe_ticket

| Info | Valeur |
|------|--------|
| Lignes | 336033 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `numero_tpe` | int | 10 | non |  | 40 |
| 2 | `date_comptable` | char | 8 | non |  | 1382 |
| 3 | `moyen_de_paiement` | nvarchar | 4 | non |  | 7 |
| 4 | `ordre_saisie` | int | 10 | non |  | 7 |
| 5 | `montant` | float | 53 | non |  | 6669 |
| 6 | `numero_remise` | nvarchar | 32 | non |  | 4548 |
| 7 | `date_operation_tpe` | char | 8 | non |  | 1382 |
| 8 | `buffer_libre` | nvarchar | 36 | non |  | 2 |
| 9 | `service` | nvarchar | 4 | non |  | 6 |
| 10 | `vad` | bit |  | non |  | 1 |
| 11 | `TPE_reel` | nvarchar | 50 | non |  | 1 |
| 12 | `time_operation_create` | char | 6 | non |  | 2438 |
| 13 | `date_operation_update` | char | 8 | non |  | 540 |
| 14 | `time_operation_update` | char | 6 | non |  | 2421 |
| 15 | `operateur_create` | nvarchar | 8 | non |  | 18 |
| 16 | `operateur_update` | nvarchar | 8 | non |  | 17 |
| 17 | `terminal_create` | int | 10 | non |  | 18 |
| 18 | `terminal_update` | int | 10 | non |  | 18 |
| 19 | `hostname_create` | nvarchar | 50 | non |  | 1 |
| 20 | `hostname_update` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `numero_tpe` (40 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 5, 6, 7, 8, 9
```

### `moyen_de_paiement` (7 valeurs)

```
ALIP, AMEX, CCAU, UNIO, VISA, WECH, ZZZ
```

### `ordre_saisie` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 99
```

### `buffer_libre` (2 valeurs)

```
, 80
```

### `service` (6 valeurs)

```
, BARD, BOUT, ESTH, EXCU, REST
```

### `vad` (1 valeurs)

```
0
```

### `operateur_create` (18 valeurs)

```
, ALEKSEI, ARKON, BARMGR, BEAM, BTQMGR, DADA, DOREEN, ESTELLE, EXCMGR, GIFT, JAA, JOLIE, MICKY, MIND, REST, SPAMGR, WELCMGR
```

### `operateur_update` (17 valeurs)

```
, ARKON, BARMGR, BEAM, BTQMGR, DADA, DOREEN, ESTELLE, EXCMGR, GIFT, JAA, JOLIE, MICKY, MIND, REST, SPAMGR, WELCMGR
```

### `terminal_create` (18 valeurs)

```
0, 1, 21, 22, 430, 431, 432, 433, 540, 541, 550, 551, 570, 571, 80, 801, 90, 942
```

### `terminal_update` (18 valeurs)

```
0, 1, 21, 22, 430, 431, 432, 433, 540, 541, 550, 570, 571, 80, 801, 90, 942, 990
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_tpe_ticket_IDX_2 | NONCLUSTERED | oui | date_comptable, service, numero_tpe, ordre_saisie, date_operation_tpe |
| caisse_tpe_ticket_IDX_1 | NONCLUSTERED | oui | numero_tpe, date_comptable, service, moyen_de_paiement, date_operation_tpe |

