# pv_equipment_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_matos` | int | 10 | non |  | 0 |
| 2 | `classification` | int | 10 | non |  | 0 |
| 3 | `serial_number` | nvarchar | 15 | non |  | 0 |
| 4 | `equipment_id` | nvarchar | 10 | non |  | 0 |
| 5 | `model_id` | int | 10 | non |  | 0 |
| 6 | `model_year` | nvarchar | 4 | non |  | 0 |
| 7 | `manufacturer_id` | int | 10 | non |  | 0 |
| 8 | `lenght` | int | 10 | non |  | 0 |
| 9 | `nickname` | nvarchar | 10 | non |  | 0 |
| 10 | `binding_model_id` | int | 10 | non |  | 0 |
| 11 | `binding_manufacturer_id` | int | 10 | non |  | 0 |
| 12 | `binding_year` | nvarchar | 4 | non |  | 0 |
| 13 | `status` | nvarchar | 10 | non |  | 0 |
| 14 | `ownership_id` | int | 10 | non |  | 0 |
| 15 | `date_update` | char | 8 | non |  | 0 |
| 16 | `time_update` | char | 6 | non |  | 0 |
| 17 | `user_update` | nvarchar | 10 | non |  | 0 |
| 18 | `pv_service` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_equipment_dat_IDX_4 | NONCLUSTERED | non | pv_service, classification, status, equipment_id |
| pv_equipment_dat_IDX_6 | NONCLUSTERED | non | pv_service, status, type_matos, classification |
| pv_equipment_dat_IDX_5 | NONCLUSTERED | non | pv_service, manufacturer_id, type_matos, classification, status |
| pv_equipment_dat_IDX_2 | NONCLUSTERED | oui | pv_service, equipment_id |
| pv_equipment_dat_IDX_1 | NONCLUSTERED | oui | pv_service, type_matos, classification, lenght, equipment_id |
| pv_equipment_dat_IDX_3 | NONCLUSTERED | non | pv_service, serial_number |

