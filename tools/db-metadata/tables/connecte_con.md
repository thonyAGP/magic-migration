# connecte_con

| Info | Valeur |
|------|--------|
| Lignes | 70 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `application` | nvarchar | 6 | non |  | 9 |
| 2 | `username` | nvarchar | 20 | non |  | 39 |
| 3 | `date_connection` | char | 8 | non |  | 33 |
| 4 | `heure_de_connection` | char | 6 | non |  | 65 |
| 5 | `heure_verification` | char | 6 | non |  | 67 |
| 6 | `deconnection` | bit |  | non |  | 1 |
| 7 | `terminal` | int | 10 | non |  | 27 |
| 8 | `hostname_con` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `application` (9 valeurs)

```
CA, CP, CV, OD, PB, PP, PT, PV, RQ
```

### `username` (39 valeurs)

```
ALEKSEI, ALVIN, ARKON, ASSTHK, AUN, BAR1, BEAM, BERTA, BTQ, DADA, DILIA, DOREEN, FLORIAN, GIFT, HOUSEK, ISLA, JAA, KIMMY, MANAKA, NUENG, OAT, ORIANE, PEPSI, PLANNING, PRAKBAR, PRYME, RDM, REC, REMI, REST, SALES, SCUBA, SPAMGR, TRAFFIC, TRAFFIC2, WELCMGR, WENDY, WINNIE, YUVIA
```

### `date_connection` (33 valeurs)

```
20220211, 20221020, 20221031, 20230126, 20230127, 20230329, 20230516, 20230517, 20230904, 20231029, 20231030, 20231031, 20231125, 20240511, 20250312, 20250317, 20250323, 20250608, 20250609, 20250719, 20250917, 20251013, 20251018, 20251027, 20251104, 20251118, 20251208, 20251217, 20251218, 20251221, 20251222, 20251223, 20251224
```

### `deconnection` (1 valeurs)

```
0
```

### `terminal` (27 valeurs)

```
22, 300, 371, 430, 431, 432, 433, 5, 500, 530, 540, 541, 570, 571, 582, 70, 710, 750, 751, 775, 810, 90, 91, 920, 942, 960, 980
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| connecte_con_IDX_1 | NONCLUSTERED | oui | application, username |

