# caisse_caissstd_montant

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hism_user` | nvarchar | 8 | non |  | 0 |
| 2 | `hism_quand` | nvarchar | 1 | non |  | 0 |
| 3 | `hism_chrono_histo` | float | 53 | non |  | 0 |
| 4 | `hism_ordre` | int | 10 | non |  | 0 |
| 5 | `hism_chrono` | int | 10 | non |  | 0 |
| 6 | `hism_montant` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_caissstd_montant_IDX_1 | NONCLUSTERED | oui | hism_user, hism_quand, hism_chrono_histo, hism_ordre, hism_chrono |

