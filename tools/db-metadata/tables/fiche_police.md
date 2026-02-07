# fiche_police

**Nom logique Magic** : `fiche_police`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 63 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fpo_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `fpo_compte` | int | 10 | non |  | 0 |
| 3 | `fpo_filiation_compte` | int | 10 | non |  | 0 |
| 4 | `fpo_numero_adherent` | float | 53 | non |  | 0 |
| 5 | `fpo_filiation_club` | int | 10 | non |  | 0 |
| 6 | `fpo_type_de_client` | nvarchar | 1 | non |  | 0 |
| 7 | `fpo_qualite` | nvarchar | 3 | non |  | 0 |
| 8 | `fpo_qualite_comp` | nvarchar | 4 | non |  | 0 |
| 9 | `fpo_nom_complet` | nvarchar | 30 | non |  | 0 |
| 10 | `fpo_prenom_complet` | nvarchar | 20 | non |  | 0 |
| 11 | `fpo_titre` | nvarchar | 2 | non |  | 0 |
| 12 | `fpo_date_debut_sejour` | char | 8 | non |  | 0 |
| 13 | `fpo_date_fin_sejour` | char | 8 | non |  | 0 |
| 14 | `fpo_pays_naissance` | nvarchar | 3 | non |  | 0 |
| 15 | `fpo_date_naissance` | char | 8 | non |  | 0 |
| 16 | `fpo_immatriculation` | nvarchar | 30 | oui |  | 0 |
| 17 | `fpo_code_nationalite` | nvarchar | 2 | non |  | 0 |
| 18 | `fpo_nationalite` | nvarchar | 50 | non |  | 0 |
| 19 | `fpo_ville_naissance` | nvarchar | 35 | non |  | 0 |
| 20 | `fpo_code_inscription` | nvarchar | 3 | non |  | 0 |
| 21 | `fpo_profession` | nvarchar | 20 | non |  | 0 |
| 22 | `fpo_piece_id` | nvarchar | 1 | non |  | 0 |
| 23 | `fpo_numero_piece` | nvarchar | 30 | non |  | 0 |
| 24 | `fpo_numero_cpf_bresil` | nvarchar | 11 | non |  | 0 |
| 25 | `fpo_date_delivrance` | char | 8 | non |  | 0 |
| 26 | `fpo_date_validite` | char | 8 | non |  | 0 |
| 27 | `fpo_ville_delivrance` | nvarchar | 50 | non |  | 0 |
| 28 | `fpo_pays_delivrance` | nvarchar | 3 | non |  | 0 |
| 29 | `fpo_num_dans_la_rue` | nvarchar | 10 | non |  | 0 |
| 30 | `fpo_nom_de_la_rue` | nvarchar | 30 | non |  | 0 |
| 31 | `fpo_pays_residence` | nvarchar | 3 | non |  | 0 |
| 32 | `fpo_code_postal` | nvarchar | 10 | non |  | 0 |
| 33 | `fpo_nom_commune` | nvarchar | 35 | non |  | 0 |
| 34 | `fpo_date_entree_pays` | char | 8 | non |  | 0 |
| 35 | `fpo_raison_visite` | nvarchar | 6 | non |  | 0 |
| 36 | `fpo_ville_bureau_dis` | nvarchar | 30 | non |  | 0 |
| 37 | `fpo_etat_province` | nvarchar | 10 | non |  | 0 |
| 38 | `fpo_acte_naissance` | nvarchar | 30 | non |  | 0 |
| 39 | `fpo_carte_mercosul` | nvarchar | 30 | non |  | 0 |
| 40 | `fpo_telephone_fixe` | nvarchar | 30 | non |  | 0 |
| 41 | `fpo_telephone_mobile` | nvarchar | 30 | non |  | 0 |
| 42 | `fpo_pays_avant` | nvarchar | 2 | non |  | 0 |
| 43 | `fpo_pays_apres` | nvarchar | 2 | non |  | 0 |
| 44 | `fpo_transport_arrivee` | nvarchar | 6 | non |  | 0 |
| 45 | `fpo_emetteur_identite` | nvarchar | 100 | non |  | 0 |
| 46 | `fpo_etat_residence` | nvarchar | 60 | non |  | 0 |
| 47 | `fpo_ville_residence` | nvarchar | 60 | non |  | 0 |
| 48 | `fpo_ibge_ville_residence` | nvarchar | 7 | non |  | 0 |
| 49 | `fpo_etat_avant` | nvarchar | 60 | non |  | 0 |
| 50 | `fpo_ville_avant` | nvarchar | 60 | non |  | 0 |
| 51 | `fpo_ibge_ville_avant` | nvarchar | 7 | non |  | 0 |
| 52 | `fpo_etat_apres` | nvarchar | 60 | non |  | 0 |
| 53 | `fpo_ville_apres` | nvarchar | 60 | non |  | 0 |
| 54 | `fpo_ibge_ville_apres` | nvarchar | 7 | non |  | 0 |
| 55 | `fpo_turkid` | nvarchar | 30 | non |  | 0 |
| 56 | `fpo_adr_libre1` | nvarchar | 35 | non |  | 0 |
| 57 | `fpo_adr_libre2` | nvarchar | 35 | non |  | 0 |
| 58 | `fpo_adr_bat_esc` | nvarchar | 10 | non |  | 0 |
| 59 | `fpo_ville_origine` | nvarchar | 30 | non |  | 0 |
| 60 | `fpo_etat_origine` | nvarchar | 30 | non |  | 0 |
| 61 | `fpo_sexe` | nvarchar | 1 | non |  | 0 |
| 62 | `fpo_date_dern_modif` | char | 8 | non |  | 0 |
| 63 | `fpo_heure_dern_modif` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fiche_police_IDX_1 | NONCLUSTERED | oui | fpo_societe, fpo_compte, fpo_filiation_compte |
| fiche_police_IDX_2 | NONCLUSTERED | oui | fpo_numero_adherent, fpo_filiation_club, fpo_type_de_client |

