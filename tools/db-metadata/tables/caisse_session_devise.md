# caisse_session_devise

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 0 |
| 2 | `chrono_session` | float | 53 | non |  | 0 |
| 3 | `chrono_detail` | int | 10 | non |  | 0 |
| 4 | `type` | nvarchar | 1 | non |  | 0 |
| 5 | `quand` | nvarchar | 1 | non |  | 0 |
| 6 | `code_devise` | nvarchar | 3 | non |  | 0 |
| 7 | `mode_paiement` | nvarchar | 4 | non |  | 0 |
| 8 | `quantite` | float | 53 | non |  | 0 |
| 9 | `date` | char | 8 | non |  | 0 |
| 10 | `heure` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_session_devise_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail, code_devise, mode_paiement |

