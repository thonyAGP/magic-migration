# caisse_coffre_compcais_devise_histo

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hisd_user` | nvarchar | 8 | non |  | 0 |
| 2 | `hisd_quand` | nvarchar | 1 | non |  | 0 |
| 3 | `hisd_chrono_histo` | float | 53 | non |  | 0 |
| 4 | `hisd_ordre` | int | 10 | non |  | 0 |
| 5 | `hisd_code_devise` | nvarchar | 3 | non |  | 0 |
| 6 | `hisd_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 7 | `hisd_quantite` | float | 53 | non |  | 0 |
| 8 | `hisd_chronosession` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_coffre_compcais_devise_histo_IDX_1 | NONCLUSTERED | oui | hisd_user, hisd_chrono_histo, hisd_ordre, hisd_code_devise, hisd_mode_paiement |

