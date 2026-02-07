# cafil114_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_traitement` | char | 8 | non |  | 0 |
| 2 | `heure_traitement` | char | 6 | non |  | 0 |
| 3 | `date_jour` | char | 8 | non |  | 0 |
| 4 | `heure_jour` | char | 6 | non |  | 0 |
| 5 | `numero_terminal` | int | 10 | non |  | 0 |
| 6 | `code` | nvarchar | 2 | non |  | 0 |
| 7 | `essais` | int | 10 | non |  | 0 |
| 8 | `commande` | nvarchar | 100 | non |  | 0 |
| 9 | `hostname_fe` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil114_dat_IDX_2 | NONCLUSTERED | oui | date_traitement, heure_traitement, date_jour, heure_jour, numero_terminal, hostname_fe |
| cafil114_dat_IDX_1 | NONCLUSTERED | non | date_traitement, heure_traitement |

