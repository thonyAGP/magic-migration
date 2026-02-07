# caisse_pointage_article

| Info | Valeur |
|------|--------|
| Lignes | 146 |
| Colonnes | 21 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 15 |
| 2 | `chrono_session` | float | 53 | non |  | 65 |
| 3 | `chrono_detail` | int | 10 | non |  | 8 |
| 4 | `type` | nvarchar | 1 | non |  | 2 |
| 5 | `quand` | nvarchar | 1 | non |  | 3 |
| 6 | `code_article` | int | 10 | non |  | 4 |
| 7 | `libelle_article` | nvarchar | 16 | non |  | 4 |
| 8 | `prix_unitaire` | float | 53 | non |  | 4 |
| 9 | `quantite` | int | 10 | non |  | 17 |
| 10 | `montant` | float | 53 | non |  | 33 |
| 11 | `date` | char | 8 | non |  | 55 |
| 12 | `heure` | char | 6 | non |  | 74 |
| 13 | `terminal` | nvarchar | 3 | non |  | 6 |
| 14 | `pointage` | nvarchar | 1 | non |  | 2 |
| 15 | `date_comptable` | char | 8 | non |  | 54 |
| 16 | `session_pointage` | float | 53 | non |  | 54 |
| 17 | `session_pointage_date` | char | 8 | non |  | 54 |
| 18 | `session_pointage_heure` | char | 6 | non |  | 99 |
| 19 | `session_pointage_qui` | nvarchar | 8 | non |  | 2 |
| 20 | `buffer_extension` | nvarchar | 20 | non |  | 1 |
| 21 | `hostname_pa` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (15 valeurs)

```
APPLE, ARKON, AUNKO, BATU, BEAM, EVE, GIFT, ING, JAA, MICKY, MIMI, MIND, TEMMY, TIK, WELCMGR
```

### `chrono_detail` (8 valeurs)

```
10, 2, 3, 5, 6, 7, 8, 9
```

### `type` (2 valeurs)

```
E, V
```

### `quand` (3 valeurs)

```
F, O, P
```

### `code_article` (4 valeurs)

```
553, 554, 555, 557
```

### `libelle_article` (4 valeurs)

```
1D PREMIUM, 1D SILVER, 1W SILVER M, 7D PREMIUM
```

### `prix_unitaire` (4 valeurs)

```
105, 1300, 210, 650
```

### `quantite` (17 valeurs)

```
1, 10, 100, 12, 15, 194, 2, 200, 272, 286, 3, 4, 5, 50, 6, 7, 8
```

### `montant` (33 valeurs)

```
10400, 1050, 10500, 1260, 1300, 13000, 130000, 1470, 1680, 185900, 1950, 19500, 210, 21000, 2520, 252200, 2600, 260000, 28560, 315, 3250, 3900, 420, 42000, 5200, 525, 630, 650, 6500, 65000, 7800, 840, 9100
```

### `terminal` (6 valeurs)

```
090, 430, 431, 432, 433, 570
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
| caisse_pointage_article_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail, code_article |
| caisse_pointage_article_IDX_2 | NONCLUSTERED | non | date_comptable, terminal, date, heure |

