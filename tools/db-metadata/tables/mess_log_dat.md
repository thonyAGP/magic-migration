# mess_log_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `message_id` | nvarchar | 7 | non |  | 0 |
| 2 | `message_for_room` | nvarchar | 6 | non |  | 0 |
| 3 | `message_for_name` | nvarchar | 20 | non |  | 0 |
| 4 | `date_received` | char | 8 | non |  | 0 |
| 5 | `time_received` | char | 6 | non |  | 0 |
| 6 | `type_message` | nvarchar | 1 | non |  | 0 |
| 7 | `user_receive` | nvarchar | 10 | non |  | 0 |
| 8 | `message_recu__` | bit |  | non |  | 0 |
| 9 | `date_picked_up` | char | 8 | non |  | 0 |
| 10 | `time_picked_up` | char | 6 | non |  | 0 |
| 11 | `user_pick_up` | nvarchar | 10 | non |  | 0 |
| 12 | `comment` | nvarchar | 1000 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| mess_log_dat_IDX_2 | NONCLUSTERED | non | date_received, time_received |
| mess_log_dat_IDX_1 | NONCLUSTERED | oui | message_id |

