# golftar_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tar_num_article` | int | 10 | non |  | 0 |
| 2 | `tar_moyen_paiement` | nvarchar | 1 | non |  | 0 |
| 3 | `tar_nom` | nvarchar | 15 | non |  | 0 |
| 4 | `tar_prenom` | nvarchar | 8 | non |  | 0 |
| 5 | `tar_type` | nvarchar | 1 | non |  | 0 |
| 6 | `tar_code` | int | 10 | non |  | 0 |
| 7 | `tar_pv_unitaire` | float | 53 | non |  | 0 |
| 8 | `tar__` | int | 10 | non |  | 0 |
| 9 | `tar_user` | nvarchar | 8 | non |  | 0 |
| 10 | `tar_montant` | float | 53 | non |  | 0 |
| 11 | `tar_quantite` | int | 10 | non |  | 0 |
| 12 | `tar_num_facture` | int | 10 | non |  | 0 |
| 13 | `RowId_334` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| golftar_dat_IDX_2 | NONCLUSTERED | oui | RowId_334 |
| golftar_dat_IDX_1 | NONCLUSTERED | non | tar_moyen_paiement, tar_num_article |

