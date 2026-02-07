# arc_cafil017_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `arc_dga_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `arc_dga_code_gm` | int | 10 | non |  | 0 |
| 3 | `arc_dga_filiation` | int | 10 | non |  | 0 |
| 4 | `arc_dga_date_depot` | char | 8 | non |  | 0 |
| 5 | `arc_dga_heure_depot` | char | 6 | non |  | 0 |
| 6 | `arc_dga_date_retrait` | char | 8 | non |  | 0 |
| 7 | `arc_dga_heure_retrait` | char | 6 | non |  | 0 |
| 8 | `arc_dga_type_depot` | nvarchar | 4 | non |  | 0 |
| 9 | `arc_dga_devise` | nvarchar | 3 | non |  | 0 |
| 10 | `arc_dga_montant` | float | 53 | non |  | 0 |
| 11 | `arc_dga_etat` | nvarchar | 1 | non |  | 0 |
| 12 | `arc_dga_operateur` | nvarchar | 8 | non |  | 0 |
| 13 | `arc_dga_num_dossier_pms` | nvarchar | 32 | non |  | 0 |
| 14 | `arc_dga_num_dossier_axis` | nvarchar | 32 | oui |  | 0 |
| 15 | `arc_dga_num_dossier_na` | nvarchar | 32 | oui |  | 0 |
| 16 | `arc_dga_num_dossier` | nvarchar | 30 | non |  | 0 |
| 17 | `arc_dga_date_reactivation` | char | 8 | non |  | 0 |
| 18 | `arc_dga_heure_reactivation` | char | 6 | non |  | 0 |
| 19 | `arc_dga_user_reactivation` | nvarchar | 8 | non |  | 0 |
| 20 | `arc_dga_date_purge` | char | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| arc_cafil017_dat_IDX_2 | NONCLUSTERED | oui | arc_dga_date_purge, arc_dga_societe, arc_dga_code_gm, arc_dga_filiation |
| arc_cafil017_dat_IDX_1 | NONCLUSTERED | oui | arc_dga_date_purge, arc_dga_societe, arc_dga_code_gm |

