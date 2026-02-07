# fiscalitegrec_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 49 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fic_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `fic_compte` | int | 10 | non |  | 0 |
| 3 | `fic_filiation` | int | 10 | non |  | 0 |
| 4 | `fic_titre` | nvarchar | 2 | non |  | 0 |
| 5 | `fic_nom` | nvarchar | 30 | non |  | 0 |
| 6 | `fic_prenom` | nvarchar | 20 | non |  | 0 |
| 7 | `fic_bebe` | nvarchar | 1 | non |  | 0 |
| 8 | `fic_type_client` | nvarchar | 1 | non |  | 0 |
| 9 | `fic_num_adherent` | float | 53 | non |  | 0 |
| 10 | `fic_lettre_controle` | nvarchar | 1 | non |  | 0 |
| 11 | `fic_filiation_club` | int | 10 | non |  | 0 |
| 12 | `fic_date_naissance` | char | 8 | non |  | 0 |
| 13 | `fic_ville_naissance` | nvarchar | 35 | non |  | 0 |
| 14 | `fic_pays_naissance` | nvarchar | 3 | non |  | 0 |
| 15 | `fic_code_inscription` | nvarchar | 3 | non |  | 0 |
| 16 | `fic_code_vente` | nvarchar | 3 | non |  | 0 |
| 17 | `fic_nationalite` | nvarchar | 2 | non |  | 0 |
| 18 | `fic_profession` | nvarchar | 20 | non |  | 0 |
| 19 | `fic_piece_identite` | nvarchar | 1 | non |  | 0 |
| 20 | `fic_num_piece` | nvarchar | 30 | non |  | 0 |
| 21 | `fic_date_delivrance` | char | 8 | non |  | 0 |
| 22 | `fic_date_de_validite` | char | 8 | non |  | 0 |
| 23 | `fic_ville_delivrance` | nvarchar | 35 | non |  | 0 |
| 24 | `fic_pays_delivrance` | nvarchar | 3 | non |  | 0 |
| 25 | `fic_commune` | nvarchar | 35 | non |  | 0 |
| 26 | `fic_code_postal` | nvarchar | 10 | non |  | 0 |
| 27 | `fic_ville` | nvarchar | 30 | non |  | 0 |
| 28 | `fic_etat_province` | nvarchar | 10 | non |  | 0 |
| 29 | `fic_pays_residence` | nvarchar | 3 | non |  | 0 |
| 30 | `fic_num_dans_la_rue` | nvarchar | 10 | non |  | 0 |
| 31 | `fic_nom_de_la_rue` | nvarchar | 30 | non |  | 0 |
| 32 | `fic_nationalite2` | nvarchar | 35 | non |  | 0 |
| 33 | `fic_nb_sejour_club` | int | 10 | non |  | 0 |
| 34 | `fic_nb_sejour_villag` | int | 10 | non |  | 0 |
| 35 | `fic_code_fidelite` | nvarchar | 8 | non |  | 0 |
| 36 | `fic_liste_blanche` | nvarchar | 1 | non |  | 0 |
| 37 | `fic_honey_moon` | nvarchar | 1 | non |  | 0 |
| 38 | `fic_type_resp_dette` | nvarchar | 1 | non |  | 0 |
| 39 | `fic_resp_dette_paris` | int | 10 | non |  | 0 |
| 40 | `fic_num_dossier` | int | 10 | non |  | 0 |
| 41 | `fic_num_ordre` | int | 10 | non |  | 0 |
| 42 | `fic_num_import` | int | 10 | non |  | 0 |
| 43 | `fic_age` | int | 10 | non |  | 0 |
| 44 | `fic_sexe` | nvarchar | 1 | non |  | 0 |
| 45 | `fic_chambre` | nvarchar | 6 | non |  | 0 |
| 46 | `fic_date_debut_sejour` | char | 8 | non |  | 0 |
| 47 | `fic_date_fin_de_sejour` | char | 8 | non |  | 0 |
| 48 | `fic_type_go_gm` | nvarchar | 2 | non |  | 0 |
| 49 | `fic_complement_type` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fiscalitegrec_dat_IDX_1 | NONCLUSTERED | oui | fic_societe, fic_compte, fic_filiation |
| fiscalitegrec_dat_IDX_3 | NONCLUSTERED | non | fic_date_debut_sejour, fic_date_fin_de_sejour, fic_type_go_gm |
| fiscalitegrec_dat_IDX_2 | NONCLUSTERED | non | fic_date_fin_de_sejour |

