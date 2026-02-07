# log_maj_tpe

**Nom logique Magic** : `log_maj_tpe`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lmt_num_mat` | int | 10 | non |  | 0 |
| 2 | `lmt_tpe` | nvarchar | 20 | non |  | 0 |
| 3 | `lmt_version_prev` | nvarchar | 10 | non |  | 0 |
| 4 | `lmt_version_curr` | nvarchar | 10 | non |  | 0 |
| 5 | `lmt_date_maj` | char | 8 | non |  | 0 |
| 6 | `lmt_time_maj` | char | 6 | non |  | 0 |
| 7 | `lmt_maj_cal` | bit |  | non |  | 0 |
| 8 | `lmt_ticket_maj` | varbinary | MAX | oui |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_maj_tpe_IDX_1 | NONCLUSTERED | oui | lmt_num_mat, lmt_tpe |

