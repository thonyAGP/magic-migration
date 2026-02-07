# pv_rentals_histo_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `xcust_id` | float | 53 | non |  | 0 |
| 2 | `package_id` | float | 53 | non |  | 0 |
| 3 | `action_type` | nvarchar | 10 | non |  | 0 |
| 4 | `type_matos` | int | 10 | non |  | 0 |
| 5 | `classification` | int | 10 | non |  | 0 |
| 6 | `equipment_id` | nvarchar | 15 | non |  | 0 |
| 7 | `#_rental_days_requested` | float | 53 | non |  | 0 |
| 8 | `date_out` | char | 8 | non |  | 0 |
| 9 | `time_out` | char | 6 | non |  | 0 |
| 10 | `date_in` | char | 8 | non |  | 0 |
| 11 | `time_in` | char | 6 | non |  | 0 |
| 12 | `status` | nvarchar | 10 | non |  | 0 |
| 13 | `comment` | nvarchar | 100 | non |  | 0 |
| 14 | `date_create` | char | 8 | non |  | 0 |
| 15 | `time_create` | char | 6 | non |  | 0 |
| 16 | `user_create` | nvarchar | 10 | non |  | 0 |
| 17 | `date_update` | char | 8 | non |  | 0 |
| 18 | `time_update` | char | 6 | non |  | 0 |
| 19 | `user_update` | nvarchar | 10 | non |  | 0 |
| 20 | `pv_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_rentals_histo_dat_IDX_3 | NONCLUSTERED | non | pv_service, equipment_id, date_out, time_out |
| pv_rentals_histo_dat_IDX_1 | NONCLUSTERED | oui | pv_service, xcust_id, package_id, type_matos, date_out, time_out, equipment_id |
| pv_rentals_histo_dat_IDX_2 | NONCLUSTERED | non | pv_service, xcust_id, equipment_id |

