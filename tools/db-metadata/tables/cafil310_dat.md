# cafil310_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 42 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gmc_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `gmc_compte` | int | 10 | non |  | 0 |
| 3 | `gmc_filiation_compte` | int | 10 | non |  | 0 |
| 4 | `gmc_titre` | nvarchar | 2 | non |  | 0 |
| 5 | `gmc_nom_complet` | nvarchar | 30 | non |  | 0 |
| 6 | `gmc_prenom_complet` | nvarchar | 20 | non |  | 0 |
| 7 | `gmc_bebe` | nvarchar | 1 | non |  | 0 |
| 8 | `gmc_type_de_client` | nvarchar | 1 | non |  | 0 |
| 9 | `gmc_numero_adherent` | float | 53 | non |  | 0 |
| 10 | `gmc_lettre_controle` | nvarchar | 1 | non |  | 0 |
| 11 | `gmc_filiation_club` | int | 10 | non |  | 0 |
| 12 | `gmc_date_naissance` | char | 8 | non |  | 0 |
| 13 | `gmc_ville_naissance` | nvarchar | 35 | non |  | 0 |
| 14 | `gmc_pays_naissance` | nvarchar | 3 | non |  | 0 |
| 15 | `gmc_code_inscription` | nvarchar | 3 | non |  | 0 |
| 16 | `gmc_code_vente` | nvarchar | 3 | non |  | 0 |
| 17 | `gmc_code_nationalite` | nvarchar | 2 | non |  | 0 |
| 18 | `gmc_profession` | nvarchar | 20 | non |  | 0 |
| 19 | `gmc_piece_id` | nvarchar | 1 | non |  | 0 |
| 20 | `gmc_numero_piece` | nvarchar | 30 | non |  | 0 |
| 21 | `gmc_date_delivrance` | char | 8 | non |  | 0 |
| 22 | `gmc_date_validite` | char | 8 | non |  | 0 |
| 23 | `gmc_ville_delivrance` | nvarchar | 35 | non |  | 0 |
| 24 | `gmc_pays_delivrance` | nvarchar | 3 | non |  | 0 |
| 25 | `gmc_nom_commune` | nvarchar | 35 | non |  | 0 |
| 26 | `gmc_code_postal` | nvarchar | 10 | non |  | 0 |
| 27 | `gmc_ville_bureau_dis` | nvarchar | 30 | non |  | 0 |
| 28 | `gmc_etat_province` | nvarchar | 10 | non |  | 0 |
| 29 | `gmc_pays_residence` | nvarchar | 3 | non |  | 0 |
| 30 | `gmc_num_dans_la_rue` | nvarchar | 10 | non |  | 0 |
| 31 | `gmc_nom_de_la_rue` | nvarchar | 30 | non |  | 0 |
| 32 | `gmc_nationalite` | nvarchar | 35 | non |  | 0 |
| 33 | `gmc_nbre_sejour_club` | int | 10 | non |  | 0 |
| 34 | `gmc_nbre_sejour_vill` | int | 10 | non |  | 0 |
| 35 | `gmc_code_fidelite` | nvarchar | 8 | non |  | 0 |
| 36 | `gmc_liste_blanche` | nvarchar | 1 | non |  | 0 |
| 37 | `gmc_honey` | nvarchar | 1 | non |  | 0 |
| 38 | `gmc_type_resp_dette` | nvarchar | 1 | non |  | 0 |
| 39 | `gmc_resp_dette_paris` | int | 10 | non |  | 0 |
| 40 | `gmc_numero_dossier` | int | 10 | non |  | 0 |
| 41 | `gmc_numero_ordre` | int | 10 | non |  | 0 |
| 42 | `gmc_numero_import` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil310_dat_IDX_2 | NONCLUSTERED | oui | gmc_societe, gmc_type_de_client, gmc_numero_adherent, gmc_filiation_club |
| cafil310_dat_IDX_3 | NONCLUSTERED | non | gmc_numero_import |
| cafil310_dat_IDX_1 | NONCLUSTERED | oui | gmc_societe, gmc_compte, gmc_filiation_compte |
| cafil310_dat_IDX_4 | NONCLUSTERED | oui | gmc_numero_adherent, gmc_filiation_club, gmc_type_de_client |

