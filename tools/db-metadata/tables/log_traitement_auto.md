# log_traitement_auto

**Nom logique Magic** : `log_traitement_auto`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lta_code_traitement` | nvarchar | 10 | non |  | 0 |
| 2 | `lta_date_debut` | char | 8 | non |  | 0 |
| 3 | `lta_heure_debut` | char | 6 | non |  | 0 |
| 4 | `lta_date_fin` | char | 8 | non |  | 0 |
| 5 | `lta_heure_fin` | char | 6 | non |  | 0 |
| 6 | `lta_statut_traitement` | bit |  | non |  | 0 |
| 7 | `lta_num01` | int | 10 | non |  | 0 |
| 8 | `lta_num02` | int | 10 | non |  | 0 |
| 9 | `lta_num03` | int | 10 | non |  | 0 |
| 10 | `lta_num04` | int | 10 | non |  | 0 |
| 11 | `lta_num05` | int | 10 | non |  | 0 |
| 12 | `lta_commentaire` | nvarchar | 500 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_traitement_auto_IDX_1 | NONCLUSTERED | oui | lta_code_traitement, lta_date_debut, lta_heure_debut |

