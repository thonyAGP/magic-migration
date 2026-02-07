# log_tpe_ent_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 0 |
| 2 | `date_debut` | char | 8 | non |  | 0 |
| 3 | `heure_debut` | char | 6 | non |  | 0 |
| 4 | `chaine_envoyee` | nvarchar | 199 | non |  | 0 |
| 5 | `forcer_transac` | bit |  | non |  | 0 |
| 6 | `statut_final` | bit |  | non |  | 0 |
| 7 | `date_fin` | char | 8 | non |  | 0 |
| 8 | `heure_fin` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_tpe_ent_dat_IDX_1 | NONCLUSTERED | oui | chrono |

