# email

| Info | Valeur |
|------|--------|
| Lignes | 4588 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ema_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ema_compte` | int | 10 | non |  | 2945 |
| 3 | `ema_filiation` | int | 10 | non |  | 18 |
| 4 | `ema_email` | nvarchar | 129 | non |  | 3256 |
| 5 | `ema_cnil` | nvarchar | 15 | non |  | 2 |
| 6 | `ema_report_filiation` | bit |  | non |  | 1 |
| 7 | `ema_etat_code` | nvarchar | 4 | non |  | 2 |
| 8 | `ema_date_import` | char | 8 | non |  | 108 |
| 9 | `ema_heure_import` | char | 6 | non |  | 674 |
| 10 | `ema_date_derniere_saisie_pms` | char | 8 | non |  | 82 |
| 11 | `ema_heure_derniere_saisie_pms` | char | 6 | non |  | 695 |
| 12 | `ema_user_derniere_saisie_pms` | nvarchar | 8 | non |  | 37 |
| 13 | `ema_date_export` | char | 8 | non |  | 78 |
| 14 | `ema_time_export` | char | 6 | non |  | 69 |
| 15 | `ema_telephone_portable` | nvarchar | 20 | oui |  | 3086 |

## Valeurs distinctes

### `ema_societe` (1 valeurs)

```
C
```

### `ema_filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `ema_cnil` (2 valeurs)

```
A, R
```

### `ema_report_filiation` (1 valeurs)

```
0
```

### `ema_etat_code` (2 valeurs)

```
PMSA, PMSR
```

### `ema_user_derniere_saisie_pms` (37 valeurs)

```
, AAUM, ADD, ARKON, AYOUB, BARMGR, BEAM, BEW, CARA, DOREEN, EXC, FILM, GIFT, JAA, JADEN, JFROST, JOLIE, JULIA, KIMMY, MAI, MANOW, MILK, MIND, NAM, NINA, PALM, PATRICK, PAULINE, PLANNING, PLOY, RITA, SERGIO, SOPHIA, TOMOKA, WELCMGR, YINI, ZIX
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| email_IDX_2 | NONCLUSTERED | non | ema_date_export |
| email_IDX_1 | NONCLUSTERED | oui | ema_societe, ema_compte, ema_filiation |

