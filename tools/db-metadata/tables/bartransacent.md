# bartransacent

| Info | Valeur |
|------|--------|
| Lignes | 2632 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `bar_id` | nvarchar | 5 | non |  | 2 |
| 2 | `pos_id` | nvarchar | 3 | non |  | 11 |
| 3 | `barman_id` | nvarchar | 3 | non |  | 1 |
| 4 | `ticket_number` | nvarchar | 10 | non |  | 2632 |
| 5 | `date_ticket` | char | 8 | non |  | 613 |
| 6 | `time_ticket` | char | 6 | non |  | 2494 |
| 7 | `total_ticket` | float | 53 | non |  | 431 |
| 8 | `total_paye` | float | 53 | non |  | 394 |
| 9 | `total_credit_conso` | float | 53 | non |  | 100 |
| 10 | `ez_card_id` | nvarchar | 10 | non |  | 5 |
| 11 | `societe` | nvarchar | 1 | non |  | 1 |
| 12 | `adherent` | int | 10 | non |  | 469 |
| 13 | `filiation` | int | 10 | non |  | 9 |
| 14 | `tai_code_forfait` | nvarchar | 6 | non |  | 1 |

## Valeurs distinctes

### `bar_id` (2 valeurs)

```
BARD, REST
```

### `pos_id` (11 valeurs)

```
001, 002, 004, 005, 006, 500, 801, 920, 940, 941, 942
```

### `ez_card_id` (5 valeurs)

```
, AMEX, CCAU, VISA, WECH
```

### `societe` (1 valeurs)

```
C
```

### `filiation` (9 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 7, 8
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bartransacent_IDX_1 | NONCLUSTERED | oui | societe, adherent, filiation, ticket_number |
| bartransacent_IDX_2 | NONCLUSTERED | non | societe, adherent, filiation, date_ticket, time_ticket |

