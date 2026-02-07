# resto_resto_schedule_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `resto_id` | nvarchar | 5 | non |  | 0 |
| 2 | `date` | char | 8 | non |  | 0 |
| 3 | `max_number_of_people` | int | 10 | non |  | 0 |
| 4 | `max_number_of_tables` | int | 10 | non |  | 0 |
| 5 | `shift_duration__minutes_` | int | 10 | non |  | 0 |
| 6 | `max_number_of_people_per_shift` | int | 10 | non |  | 0 |
| 7 | `open_from` | char | 6 | non |  | 0 |
| 8 | `close_at` | char | 6 | non |  | 0 |
| 9 | `booking_open` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resto_resto_schedule_dat_IDX_1 | NONCLUSTERED | oui | resto_id, date |

