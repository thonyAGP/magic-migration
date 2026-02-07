# cafil146_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 23 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hci_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `hci_num_compte` | int | 10 | non |  | 0 |
| 3 | `hci_filiation` | int | 10 | non |  | 0 |
| 4 | `hci_package` | nvarchar | 1 | non |  | 0 |
| 5 | `hci_statut_sejour` | nvarchar | 1 | non |  | 0 |
| 6 | `hci_date_debut` | char | 8 | non |  | 0 |
| 7 | `hci_heure_debut` | nvarchar | 2 | non |  | 0 |
| 8 | `hci_date_fin` | char | 8 | non |  | 0 |
| 9 | `hci_heure_fin` | nvarchar | 2 | non |  | 0 |
| 10 | `hci__u_p__nb_occup_` | nvarchar | 3 | oui |  | 0 |
| 11 | `hci_type_hebergement` | nvarchar | 6 | non |  | 0 |
| 12 | `hci_complement_type` | nvarchar | 4 | non |  | 0 |
| 13 | `hci_libelle` | nvarchar | 19 | non |  | 0 |
| 14 | `hci_age` | nvarchar | 1 | non |  | 0 |
| 15 | `hci_nationalite` | nvarchar | 2 | non |  | 0 |
| 16 | `hci_nom_logement` | nvarchar | 6 | non |  | 0 |
| 17 | `hci_code_sexe` | nvarchar | 1 | non |  | 0 |
| 18 | `hci_code_fumeur` | nvarchar | 1 | non |  | 0 |
| 19 | `hci_lieu_sejour` | nvarchar | 1 | non |  | 0 |
| 20 | `hci_code_logement` | nvarchar | 6 | non |  | 0 |
| 21 | `hci_compactable` | nvarchar | 1 | non |  | 0 |
| 22 | `hci_age_num` | int | 10 | non |  | 0 |
| 23 | `hci_age_nb_mois` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil146_dat_IDX_2 | NONCLUSTERED | oui | hci_societe, hci_num_compte, hci_filiation, hci_date_fin, hci_package |
| cafil146_dat_IDX_4 | NONCLUSTERED | non | hci_societe, hci_package, hci_libelle, hci_statut_sejour, hci_date_debut |
| cafil146_dat_IDX_3 | NONCLUSTERED | non | hci_societe, hci_package, hci_nom_logement, hci_date_debut |
| cafil146_dat_IDX_1 | NONCLUSTERED | oui | hci_societe, hci_num_compte, hci_filiation, hci_date_debut, hci_package |

