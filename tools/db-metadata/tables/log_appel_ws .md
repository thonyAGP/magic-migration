# log_appel_ws 

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `law_code_traitement` | nvarchar | 30 | non |  | 0 |
| 2 | `law_provenance` | nvarchar | 200 | non |  | 0 |
| 3 | `law_date_traitement` | char | 8 | non |  | 0 |
| 4 | `law_heure_traitement` | char | 6 | non |  | 0 |
| 5 | `law_statut_traitement` | bit |  | non |  | 0 |
| 6 | `law_option_traitement` | nvarchar | 4 | non |  | 0 |
| 7 | `law_type_retour` | nvarchar | 3 | non |  | 0 |
| 8 | `law_rowid` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_appel_ws _IDX_1 | NONCLUSTERED | oui | law_rowid |
| log_appel_ws _IDX_2 | NONCLUSTERED | oui | law_code_traitement, law_provenance, law_date_traitement, law_type_retour, law_rowid |

