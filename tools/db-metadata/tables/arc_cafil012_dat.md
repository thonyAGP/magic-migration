# arc_cafil012_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 28 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `arc_heb_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `arc_heb_num_compte` | int | 10 | non |  | 0 |
| 3 | `arc_heb_filiation` | int | 10 | non |  | 0 |
| 4 | `arc_heb_code_package` | nvarchar | 1 | non |  | 0 |
| 5 | `arc_heb_statut_sejour` | nvarchar | 1 | non |  | 0 |
| 6 | `arc_heb_date_debut` | char | 8 | non |  | 0 |
| 7 | `arc_heb_heure_debut` | nvarchar | 2 | non |  | 0 |
| 8 | `arc_heb_date_fin` | char | 8 | non |  | 0 |
| 9 | `arc_heb_heure_fin` | nvarchar | 2 | non |  | 0 |
| 10 | `arc_heb_u_p_nb_occup` | nvarchar | 3 | oui |  | 0 |
| 11 | `arc_heb_type_hebergement` | nvarchar | 6 | non |  | 0 |
| 12 | `arc_heb_complement_type` | nvarchar | 4 | non |  | 0 |
| 13 | `arc_heb_libelle` | nvarchar | 51 | non |  | 0 |
| 14 | `arc_heb_age` | nvarchar | 1 | non |  | 0 |
| 15 | `arc_heb_nationalite` | nvarchar | 2 | non |  | 0 |
| 16 | `arc_heb_nom_logement` | nvarchar | 6 | non |  | 0 |
| 17 | `arc_heb_code_sexe` | nvarchar | 1 | non |  | 0 |
| 18 | `arc_heb_code_fumeur` | nvarchar | 1 | non |  | 0 |
| 19 | `arc_heb_lieu_de_sejour` | nvarchar | 1 | non |  | 0 |
| 20 | `arc_heb_code_logement` | nvarchar | 6 | non |  | 0 |
| 21 | `arc_heb_compactage` | nvarchar | 1 | non |  | 0 |
| 22 | `arc_heb_age_num` | int | 10 | non |  | 0 |
| 23 | `arc_heb_age_nb_mois` | int | 10 | non |  | 0 |
| 24 | `arc_heb_affec_auto` | nvarchar | 1 | non |  | 0 |
| 25 | `arc_heb_affec_comment` | nvarchar | 200 | non |  | 0 |
| 26 | `arc_heb_date_purge` | char | 8 | non |  | 0 |
| 27 | `arc_heb_pyr_status` | nvarchar | 1 | non |  | 0 |
| 28 | `arc_heb_oldlgt` | nvarchar | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| arc_cafil012_dat_IDX_2 | NONCLUSTERED | oui | arc_heb_date_purge, arc_heb_societe, arc_heb_num_compte, arc_heb_filiation, arc_heb_date_fin, arc_heb_code_package |
| arc_cafil012_dat_IDX_3 | NONCLUSTERED | non | arc_heb_date_purge, arc_heb_societe, arc_heb_code_package, arc_heb_nom_logement, arc_heb_date_debut |
| arc_cafil012_dat_IDX_1 | NONCLUSTERED | oui | arc_heb_date_purge, arc_heb_societe, arc_heb_num_compte, arc_heb_filiation, arc_heb_date_debut, arc_heb_code_package |
| arc_cafil012_dat_IDX_4 | NONCLUSTERED | non | arc_heb_date_purge, arc_heb_societe, arc_heb_code_package, arc_heb_libelle, arc_heb_statut_sejour, arc_heb_date_debut |

