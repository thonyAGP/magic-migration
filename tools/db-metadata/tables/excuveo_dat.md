# excuveo_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `veo_num_vente` | int | 10 | non |  | 0 |
| 2 | `veo_moyen_paiement` | nvarchar | 6 | non |  | 0 |
| 3 | `veo_societe` | nvarchar | 1 | non |  | 0 |
| 4 | `veo_compte` | int | 10 | non |  | 0 |
| 5 | `veo_filiation` | int | 10 | non |  | 0 |
| 6 | `veo_nom` | nvarchar | 15 | non |  | 0 |
| 7 | `veo_prenom` | nvarchar | 8 | non |  | 0 |
| 8 | `veo_date_comptable` | char | 8 | non |  | 0 |
| 9 | `veo_user` | nvarchar | 8 | non |  | 0 |
| 10 | `veo_montant` | float | 53 | non |  | 0 |
| 11 | `veo_code_option` | int | 10 | non |  | 0 |
| 12 | `veo_quantite` | int | 10 | non |  | 0 |
| 13 | `veo_pv_unitaire` | float | 53 | non |  | 0 |
| 14 | `veo___reduction` | int | 10 | non |  | 0 |
| 15 | `veo_date_debut` | char | 8 | non |  | 0 |
| 16 | `veo_date_fin` | char | 8 | non |  | 0 |
| 17 | `veo_num_article` | int | 10 | non |  | 0 |
| 18 | `RowId_307` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excuveo_dat_IDX_3 | NONCLUSTERED | non | veo_code_option |
| excuveo_dat_IDX_4 | NONCLUSTERED | non | veo_date_fin |
| excuveo_dat_IDX_1 | NONCLUSTERED | non | veo_num_vente |
| excuveo_dat_IDX_2 | NONCLUSTERED | non | veo_date_comptable |
| excuveo_dat_IDX_5 | NONCLUSTERED | non | veo_societe, veo_compte, veo_filiation, veo_date_fin |
| excuveo_dat_IDX_6 | NONCLUSTERED | oui | RowId_307 |

