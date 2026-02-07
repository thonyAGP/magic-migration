# cafil_address

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 35 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gmc_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `gmc_compte` | int | 10 | non |  | 0 |
| 3 | `gmc_filiation_compte` | int | 10 | non |  | 0 |
| 4 | `gmc_titre` | nvarchar | 2 | non |  | 0 |
| 5 | `gmc_nom_complet` | nvarchar | 30 | non |  | 0 |
| 6 | `gmc_prenom_complet` | nvarchar | 20 | non |  | 0 |
| 7 | `gmc_type_de_client` | nvarchar | 1 | non |  | 0 |
| 8 | `gmc_numero_adherent` | float | 53 | non |  | 0 |
| 9 | `gmc_filiation_club` | int | 10 | non |  | 0 |
| 10 | `gmc_date_naissance` | char | 8 | non |  | 0 |
| 11 | `gmc_ville_naissance` | nvarchar | 35 | non |  | 0 |
| 12 | `gmc_pays_naissance` | nvarchar | 3 | non |  | 0 |
| 13 | `gmc_code_nationalite` | nvarchar | 2 | non |  | 0 |
| 14 | `gmc_profession` | nvarchar | 20 | non |  | 0 |
| 15 | `gmc_numero_passeport` | nvarchar | 10 | non |  | 0 |
| 16 | `gmc_date_delivrance` | char | 8 | non |  | 0 |
| 17 | `gmc_date_validite` | char | 8 | non |  | 0 |
| 18 | `gmc_ville_delivrance` | nvarchar | 35 | non |  | 0 |
| 19 | `gmc_pays_delivrance` | nvarchar | 3 | non |  | 0 |
| 20 | `gmc_nom_commune` | nvarchar | 35 | non |  | 0 |
| 21 | `gmc_code_postal` | nvarchar | 10 | non |  | 0 |
| 22 | `gmc_ville` | nvarchar | 30 | non |  | 0 |
| 23 | `gmc_etat_province` | nvarchar | 20 | non |  | 0 |
| 24 | `gmc_pays_residence` | nvarchar | 3 | non |  | 0 |
| 25 | `gmc_num_dans_la_rue` | nvarchar | 10 | non |  | 0 |
| 26 | `gmc_nom_de_la_rue` | nvarchar | 30 | non |  | 0 |
| 27 | `gmc_nationalite` | nvarchar | 35 | non |  | 0 |
| 28 | `gmc_nbre_sejour_club` | int | 10 | non |  | 0 |
| 29 | `gmc_nbre_sejour_vill` | int | 10 | non |  | 0 |
| 30 | `gmc_code_fidelite` | nvarchar | 8 | non |  | 0 |
| 31 | `email_address` | nvarchar | 60 | non |  | 0 |
| 32 | `accept_cm_emails` | bit |  | non |  | 0 |
| 33 | `export__` | bit |  | non |  | 0 |
| 34 | `date_mofif` | char | 8 | non |  | 0 |
| 35 | `time_modif` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil_address_IDX_2 | NONCLUSTERED | oui | gmc_societe, gmc_type_de_client, gmc_numero_adherent, gmc_filiation_club |
| cafil_address_IDX_1 | NONCLUSTERED | oui | gmc_societe, gmc_compte, gmc_filiation_compte |
| cafil_address_IDX_3 | NONCLUSTERED | non | export__ |

