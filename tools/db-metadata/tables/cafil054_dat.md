# cafil054_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cam_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `cam_type_de_carte` | nvarchar | 1 | non |  | 0 |
| 3 | `cam_num__serie` | int | 10 | non |  | 0 |
| 4 | `cam_statut_carte` | nvarchar | 1 | non |  | 0 |
| 5 | `cam_code_gm` | int | 10 | non |  | 0 |
| 6 | `cam_filiation` | int | 10 | non |  | 0 |
| 7 | `cam_debut_validite` | char | 8 | non |  | 0 |
| 8 | `cam_fin_de_validite` | char | 8 | non |  | 0 |
| 9 | `cam_montant_debiteur` | float | 53 | non |  | 0 |
| 10 | `cam_code_autocom` | int | 10 | non |  | 0 |
| 11 | `cam_phone_autorise` | nvarchar | 1 | non |  | 0 |
| 12 | `cam_imputation` | nvarchar | 2 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil054_dat_IDX_3 | NONCLUSTERED | non | cam_code_autocom |
| cafil054_dat_IDX_1 | NONCLUSTERED | oui | cam_societe, cam_num__serie |
| cafil054_dat_IDX_4 | NONCLUSTERED | oui | cam_num__serie |
| cafil054_dat_IDX_2 | NONCLUSTERED | non | cam_societe, cam_code_gm, cam_filiation, cam_fin_de_validite |

