# session_analyse

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sea_user` | nvarchar | 8 | non |  | 0 |
| 2 | `sea_chrono` | float | 53 | non |  | 0 |
| 3 | `sea_date_debut_session` | char | 8 | non |  | 0 |
| 4 | `sea_heure_debut_session` | char | 6 | non |  | 0 |
| 5 | `sea_date_fin_session` | char | 8 | non |  | 0 |
| 6 | `sea_heure_fin_session` | char | 6 | non |  | 0 |
| 7 | `sea_date_comptable` | char | 8 | non |  | 0 |
| 8 | `sea_pointage` | bit |  | non |  | 0 |
| 9 | `sea_dateheure_debut` | float | 53 | non |  | 0 |
| 10 | `sea_dateheure_fin` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| session_analyse_IDX_1 | NONCLUSTERED | oui | sea_user, sea_dateheure_debut |
| session_analyse_IDX_2 | NONCLUSTERED | oui | sea_user, sea_dateheure_fin, sea_dateheure_debut |

