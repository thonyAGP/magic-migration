# log_interface_tpe

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lit_id` | int | 10 | non |  | 0 |
| 2 | `lit_term_host` | nvarchar | 12 | non |  | 0 |
| 3 | `lit_date` | char | 8 | non |  | 0 |
| 4 | `lit_heure` | char | 6 | non |  | 0 |
| 5 | `lit_operation` | nvarchar | 1 | non |  | 0 |
| 6 | `lit_cmde` | varbinary | MAX | oui |  | 0 |
| 7 | `lit_rspn` | varbinary | MAX | oui |  | 0 |
| 8 | `lit_ticket` | varbinary | MAX | oui |  | 0 |
| 9 | `lit_err_msg` | nvarchar | 300 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_interface_tpe_IDX_1 | NONCLUSTERED | oui | lit_id |

