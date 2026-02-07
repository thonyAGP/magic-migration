# caisse_pointage_devise

| Info | Valeur |
|------|--------|
| Lignes | 1202 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 14 |
| 2 | `chrono_session` | float | 53 | non |  | 305 |
| 3 | `chrono_detail` | int | 10 | non |  | 6 |
| 4 | `type` | nvarchar | 1 | non |  | 1 |
| 5 | `quand` | nvarchar | 1 | non |  | 2 |
| 6 | `code_devise` | nvarchar | 3 | non |  | 14 |
| 7 | `mode_paiement` | nvarchar | 4 | non |  | 1 |
| 8 | `quantite` | float | 53 | non |  | 299 |
| 9 | `date` | char | 8 | non |  | 250 |
| 10 | `heure` | char | 6 | non |  | 583 |
| 11 | `terminal` | nvarchar | 3 | non |  | 6 |
| 12 | `pointage` | nvarchar | 1 | non |  | 2 |
| 13 | `date_comptable` | char | 8 | non |  | 233 |
| 14 | `session_pointage` | float | 53 | non |  | 239 |
| 15 | `session_pointage_date` | char | 8 | non |  | 231 |
| 16 | `session_pointage_heure` | char | 6 | non |  | 694 |
| 17 | `session_pointage_qui` | nvarchar | 8 | non |  | 2 |
| 18 | `buffer_extension` | nvarchar | 13 | non |  | 1 |
| 19 | `hostname_pd` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (14 valeurs)

```
APPLE, AUNKO, BATU, BEAM, EVE, GIFT, JAA, JOY, MICKY, MIMI, MIND, PEPSI, TIK, WELCMGR
```

### `chrono_detail` (6 valeurs)

```
10, 5, 6, 7, 8, 9
```

### `type` (1 valeurs)

```
V
```

### `quand` (2 valeurs)

```
F, P
```

### `code_devise` (14 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD
```

### `mode_paiement` (1 valeurs)

```
CASH
```

### `terminal` (6 valeurs)

```
090, 091, 430, 431, 432, 433
```

### `pointage` (2 valeurs)

```
, X
```

### `session_pointage_qui` (2 valeurs)

```
, WELCMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_pointage_devise_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail, code_devise, mode_paiement |
| caisse_pointage_devise_IDX_2 | NONCLUSTERED | non | date_comptable, terminal, date, heure |

