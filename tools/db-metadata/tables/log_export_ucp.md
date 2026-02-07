# log_export_ucp

| Info | Valeur |
|------|--------|
| Lignes | 566 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_traitement` | char | 8 | non |  | 563 |
| 2 | `heure_traitement` | char | 6 | non |  | 394 |
| 3 | `last_session_id` | int | 10 | non |  | 565 |
| 4 | `nb_record_lus` | int | 10 | non |  | 564 |
| 5 | `nb_record_export` | int | 10 | non |  | 342 |
| 6 | `row_id_exp_ucp` | int | 10 | non |  | 566 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_export_ucp_IDX_1 | NONCLUSTERED | oui | row_id_exp_ucp |
| log_export_ucp_IDX_2 | NONCLUSTERED | oui | last_session_id, row_id_exp_ucp |

