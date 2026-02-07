# restr133____

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `____date_transaction` | char | 8 | non |  | 0 |
| 2 | `____time_transaction` | char | 6 | non |  | 0 |
| 3 | `____prefixe_d_acces` | nvarchar | 2 | non |  | 0 |
| 4 | `____code_confid_` | int | 10 | non |  | 0 |
| 5 | `____nom_personne` | nvarchar | 30 | non |  | 0 |
| 6 | `____prenom_personne` | nvarchar | 20 | non |  | 0 |
| 7 | `____date_debut` | char | 8 | non |  | 0 |
| 8 | `____heure_debut` | char | 6 | non |  | 0 |
| 9 | `____nb_taxe` | int | 10 | non |  | 0 |
| 10 | `____num_ligne` | int | 10 | non |  | 0 |
| 11 | `____num_poste` | int | 10 | non |  | 0 |
| 12 | `____num_compose` | nvarchar | 23 | non |  | 0 |
| 13 | `____montant` | float | 53 | non |  | 0 |
| 14 | `____tarif_telephone` | float | 53 | non |  | 0 |
| 15 | `____duree` | char | 6 | non |  | 0 |
| 16 | `____pays_appele` | nvarchar | 20 | non |  | 0 |
| 17 | `____centre_terrestre` | nvarchar | 8 | non |  | 0 |
| 18 | `____transfert` | int | 10 | non |  | 0 |
| 19 | `____flag_gratuite` | nvarchar | 1 | non |  | 0 |
| 20 | `____raison_gratuite` | nvarchar | 15 | non |  | 0 |
| 21 | `____flag_cloture` | nvarchar | 1 | non |  | 0 |
| 22 | `RowId_451` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| restr133_____IDX_3 | NONCLUSTERED | non | ____num_poste, ____date_debut, ____heure_debut |
| restr133_____IDX_6 | NONCLUSTERED | oui | RowId_451 |
| restr133_____IDX_4 | NONCLUSTERED | non | ____date_transaction |
| restr133_____IDX_5 | NONCLUSTERED | non | ____prefixe_d_acces, ____centre_terrestre, ____num_poste, ____date_debut, ____heure_debut |
| restr133_____IDX_1 | NONCLUSTERED | non | ____prefixe_d_acces, ____date_transaction, ____time_transaction |
| restr133_____IDX_2 | NONCLUSTERED | non | ____code_confid_, ____date_debut, ____heure_debut |

