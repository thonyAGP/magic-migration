# resto_resa_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `resto_id` | nvarchar | 5 | non |  | 0 |
| 2 | `date` | char | 8 | non |  | 0 |
| 3 | `time` | char | 6 | non |  | 0 |
| 4 | `room_#` | nvarchar | 6 | non |  | 0 |
| 5 | `name` | nvarchar | 20 | non |  | 0 |
| 6 | `number_of_persons` | int | 10 | non |  | 0 |
| 7 | `section` | nvarchar | 1 | non |  | 0 |
| 8 | `table_id` | nvarchar | 3 | non |  | 0 |
| 9 | `comments` | nvarchar | 200 | non |  | 0 |
| 10 | `utilisateur` | nvarchar | 10 | non |  | 0 |
| 11 | `day_recorded` | char | 8 | non |  | 0 |
| 12 | `time_recorded` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resto_resa_dat_IDX_1 | NONCLUSTERED | oui | resto_id, date, time, room_#, name |

