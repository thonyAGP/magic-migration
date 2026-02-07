# log_booker

| Info | Valeur |
|------|--------|
| Lignes | 4788 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `log_url` | nvarchar | 2000 | oui |  | 2078 |
| 2 | `log_date` | char | 8 | non |  | 54 |
| 3 | `log_time` | char | 6 | non |  | 3706 |
| 4 | `log_service` | nvarchar | 4 | non |  | 1 |
| 5 | `log_location_id` | int | 10 | non |  | 1 |
| 6 | `log_statut_traitement` | bit |  | non |  | 2 |
| 7 | `log_login` | nvarchar | 8 | non |  | 5 |
| 8 | `log_json_in` | varbinary | MAX | oui |  | 1748 |
| 9 | `log_json_out` | varbinary | MAX | oui |  | 2752 |
| 10 | `log_rowid` | int | 10 | non |  | 4788 |

## Valeurs distinctes

### `log_service` (1 valeurs)

```
ESTH
```

### `log_location_id` (1 valeurs)

```
51682
```

### `log_statut_traitement` (2 valeurs)

```
0, 1
```

### `log_login` (5 valeurs)

```
DSIOP, SPA1, SPA2, SPA3, SPAMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_booker_IDX_2 | NONCLUSTERED | oui | log_rowid |
| log_booker_IDX_1 | NONCLUSTERED | non | log_date, log_time |

