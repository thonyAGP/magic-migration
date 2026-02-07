# reqrequests_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 40 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `request_id` | nvarchar | 7 | non |  | 0 |
| 2 | `request_type` | nvarchar | 2 | non |  | 0 |
| 3 | `reco_location_type` | nvarchar | 10 | non |  | 0 |
| 4 | `reco_date_update` | char | 8 | non |  | 0 |
| 5 | `reco_time_update` | char | 6 | non |  | 0 |
| 6 | `reco_user_update` | nvarchar | 10 | non |  | 0 |
| 7 | `reco_priority` | nvarchar | 1 | non |  | 0 |
| 8 | `reco_submitted_by` | nvarchar | 20 | non |  | 0 |
| 9 | `reco_room___service_code` | nvarchar | 6 | non |  | 0 |
| 10 | `reco_location` | nvarchar | 20 | non |  | 0 |
| 11 | `reco_site` | nvarchar | 20 | non |  | 0 |
| 12 | `reco_problem_type` | nvarchar | 3 | non |  | 0 |
| 13 | `reco_description` | nvarchar | 300 | non |  | 0 |
| 14 | `disp_date_update` | char | 8 | non |  | 0 |
| 15 | `disp_time_update` | char | 6 | non |  | 0 |
| 16 | `disp_user_update` | nvarchar | 10 | non |  | 0 |
| 17 | `disp_service` | nvarchar | 5 | non |  | 0 |
| 18 | `disp_tech_type` | nvarchar | 20 | non |  | 0 |
| 19 | `disp_tech_name` | nvarchar | 20 | non |  | 0 |
| 20 | `disp_finish_by_date` | char | 8 | non |  | 0 |
| 21 | `disp_finish_by_time` | char | 6 | non |  | 0 |
| 22 | `disp_comments` | nvarchar | 100 | non |  | 0 |
| 23 | `disp_validation` | bit |  | non |  | 0 |
| 24 | `foup_date_update` | char | 8 | non |  | 0 |
| 25 | `foup_time_update` | char | 6 | non |  | 0 |
| 26 | `foup_user_update` | nvarchar | 10 | non |  | 0 |
| 27 | `foup_controled_by` | nvarchar | 20 | non |  | 0 |
| 28 | `foup_date_repaired` | char | 8 | non |  | 0 |
| 29 | `foup_time_repaired` | char | 6 | non |  | 0 |
| 30 | `foup_status` | nvarchar | 3 | non |  | 0 |
| 31 | `foup_comment` | nvarchar | 300 | non |  | 0 |
| 32 | `foup_validation` | bit |  | non |  | 0 |
| 33 | `ctrl_date_update` | char | 8 | non |  | 0 |
| 34 | `ctrl_time_update` | char | 6 | non |  | 0 |
| 35 | `ctrl_user_update` | nvarchar | 10 | non |  | 0 |
| 36 | `ctrl_controled_by` | nvarchar | 20 | non |  | 0 |
| 37 | `ctrl_date_controled` | char | 8 | non |  | 0 |
| 38 | `ctrl_status` | nvarchar | 3 | non |  | 0 |
| 39 | `ctrl_comments` | nvarchar | 100 | non |  | 0 |
| 40 | `ctrl_validation` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| reqrequests_dat_IDX_3 | NONCLUSTERED | non | disp_date_update, disp_time_update, reco_room___service_code |
| reqrequests_dat_IDX_6 | NONCLUSTERED | non | request_type, disp_service, disp_finish_by_date, disp_finish_by_time |
| reqrequests_dat_IDX_1 | NONCLUSTERED | oui | request_id |
| reqrequests_dat_IDX_4 | NONCLUSTERED | non | foup_date_update, foup_time_update, reco_room___service_code |
| reqrequests_dat_IDX_7 | NONCLUSTERED | non | request_type, disp_service, reco_problem_type, disp_finish_by_date, disp_finish_by_time |
| reqrequests_dat_IDX_2 | NONCLUSTERED | non | reco_date_update, reco_time_update, reco_room___service_code |
| reqrequests_dat_IDX_5 | NONCLUSTERED | non | ctrl_date_update, ctrl_time_update, reco_room___service_code |
| reqrequests_dat_IDX_8 | NONCLUSTERED | non | request_type, disp_service, reco_room___service_code, disp_finish_by_date, disp_finish_by_time |

