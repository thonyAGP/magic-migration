# log_mobile_welcome

**Nom logique Magic** : `log_mobile_welcome`

| Info | Valeur |
|------|--------|
| Lignes | 201 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lmw_row_id` | int | 10 | non |  | 201 |
| 2 | `lmv_user` | nvarchar | 8 | non |  | 15 |
| 3 | `lmw_code_operation` | nvarchar | 10 | non |  | 14 |
| 4 | `lmw_libelle` | nvarchar | 200 | non |  | 20 |
| 5 | `lmw_date_operation` | char | 8 | non |  | 15 |
| 6 | `lmw_heure_operation` | char | 6 | non |  | 167 |
| 7 | `lmw_compte` | int | 10 | non |  | 21 |
| 8 | `lmw_filiation` | int | 10 | non |  | 4 |
| 9 | `lmw_chambre` | nvarchar | 6 | non |  | 15 |

## Valeurs distinctes

### `lmv_user` (15 valeurs)

```
AAR, ANNY, ASIAMIS, DANNY, FOM, HENY, JACK, MILK, MOMO, PATRICE, PEPSI, POPIANG, WARREN, YANG, ZAKI
```

### `lmw_code_operation` (14 valeurs)

```
ACCOUNT, CLIENT, FICHE_CLI, FILIATION, HOME, MESSAGE, OPEN_ACC, PBS, PHONELINE, RESROOM, ROOM, SCAN_PASS, STAY_ACTIV, UPDPHONE
```

### `lmw_libelle` (20 valeurs)

```
Access screen room reservation : A1185, Call Account Access, Call All, Call Arriving, Call Client, Call Departing, Call Home, Call Identity Client, Call manage filiation, Call Message, Call Open / Close Phone Line, Call Open Account, Call Pre booked services, Call Presents, Call Room Inventory, Call Scan Club-Med Pass, Call Stay Activity, Call Validate Club-Med Pass 0049474334, Exit Identity Client, Update telephone number - New number :
```

### `lmw_date_operation` (15 valeurs)

```
20180227, 20180228, 20180302, 20180303, 20180305, 20180306, 20180307, 20180331, 20180403, 20180412, 20180509, 20180604, 20180605, 20180731, 20181215
```

### `lmw_compte` (21 valeurs)

```
0, 478585, 485789, 486531, 486773, 486855, 486945, 487177, 487460, 487516, 487792, 487808, 487812, 488458, 488716, 489941, 490336, 490876, 491027, 495250, 495741
```

### `lmw_filiation` (4 valeurs)

```
0, 1, 2, 3
```

### `lmw_chambre` (15 valeurs)

```
 , A1185, A1188, A1348, DOME 4, H1219, H1309, K1110, L1286, L1287, L1288, P2217, S2148, S2240, T2154
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_mobile_welcome_IDX_1 | NONCLUSTERED | oui | lmw_row_id |

