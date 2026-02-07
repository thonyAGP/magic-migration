# tempo_hebergement

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 25 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tmp_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `tmp_no_compte` | int | 10 | non |  | 0 |
| 3 | `tmp_filiation` | smallint | 5 | non |  | 0 |
| 4 | `tmp_code_package` | nvarchar | 1 | non |  | 0 |
| 5 | `tmp_statut_sejour` | nvarchar | 1 | non |  | 0 |
| 6 | `tmp_date_debut` | char | 8 | non |  | 0 |
| 7 | `tmp_heure_debut` | nvarchar | 2 | non |  | 0 |
| 8 | `tmp_date_fin` | char | 8 | non |  | 0 |
| 9 | `tmp_heure_fin` | nvarchar | 2 | non |  | 0 |
| 10 | `tmp__u_p__nb_occup_` | nvarchar | 3 | non |  | 0 |
| 11 | `tmp_type_hebergement` | nvarchar | 6 | non |  | 0 |
| 12 | `tmp_complement_type` | nvarchar | 4 | non |  | 0 |
| 13 | `tmp_libelle` | nvarchar | 19 | non |  | 0 |
| 14 | `tmp_age` | nvarchar | 1 | non |  | 0 |
| 15 | `tmp_nationalite` | nvarchar | 2 | non |  | 0 |
| 16 | `tmp_nom_logement` | nvarchar | 6 | non |  | 0 |
| 17 | `tmp_code_sexe` | nvarchar | 1 | non |  | 0 |
| 18 | `tmp_code_fumeur` | nvarchar | 1 | non |  | 0 |
| 19 | `tmp_lieu_sejour` | nvarchar | 1 | non |  | 0 |
| 20 | `tmp_code_logement` | nvarchar | 6 | non |  | 0 |
| 21 | `tmp_compactable` | nvarchar | 1 | non |  | 0 |
| 22 | `tmp_age_num` | smallint | 5 | non |  | 0 |
| 23 | `tmp_type_pyr` | nvarchar | 1 | non |  | 0 |
| 24 | `tmp_fidelisation` | nvarchar | 30 | non |  | 0 |
| 25 | `tmp_ancienne_chambre` | nvarchar | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tmp_heberg_dat_IDX_1 | NONCLUSTERED | oui | tmp_societe, tmp_no_compte, tmp_filiation, tmp_date_debut, tmp_code_package |
| tmp_heberg_dat_IDX_3 | NONCLUSTERED | non | tmp_societe, tmp_code_package, tmp_nom_logement, tmp_date_debut |
| tmp_heberg_dat_IDX_4 | NONCLUSTERED | non | tmp_societe, tmp_code_package, tmp_libelle, tmp_statut_sejour, tmp_date_debut |
| tmp_heberg_dat_IDX_2 | NONCLUSTERED | oui | tmp_societe, tmp_no_compte, tmp_filiation, tmp_date_fin, tmp_code_package |

