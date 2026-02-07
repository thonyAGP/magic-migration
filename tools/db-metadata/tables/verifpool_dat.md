# verifpool_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `con_type` | nvarchar | 3 | non |  | 0 |
| 2 | `con_terminal` | int | 10 | non |  | 0 |
| 3 | `con_demande` | bit |  | non |  | 0 |
| 4 | `con_heure` | char | 6 | non |  | 0 |
| 5 | `con_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| verifpool_dat_IDX_2 | NONCLUSTERED | oui | con_terminal, con_hostname, con_demande |
| verifpool_dat_IDX_1 | NONCLUSTERED | oui | con_type, con_demande, con_terminal, con_hostname |

