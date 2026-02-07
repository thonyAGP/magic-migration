# ide

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 45 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ressource` | nvarchar | 4 | non |  | 0 |
| 2 | `nom` | nvarchar | 30 | non |  | 0 |
| 3 | `prenom` | nvarchar | 20 | non |  | 0 |
| 4 | `type_client` | nvarchar | 1 | non |  | 0 |
| 5 | `adherent_club` | nvarchar | 10 | non |  | 0 |
| 6 | `filiation_club` | nvarchar | 3 | non |  | 0 |
| 7 | `age` | nvarchar | 2 | non |  | 0 |
| 8 | `date_de_naissance` | nvarchar | 8 | non |  | 0 |
| 9 | `pays_inscription` | nvarchar | 3 | non |  | 0 |
| 10 | `langue_parlee` | nvarchar | 1 | non |  | 0 |
| 11 | `nationalite` | nvarchar | 35 | non |  | 0 |
| 12 | `profession` | nvarchar | 20 | non |  | 0 |
| 13 | `passeport` | nvarchar | 30 | non |  | 0 |
| 14 | `date_delivrance_passeport` | nvarchar | 8 | non |  | 0 |
| 15 | `ville_delivrance_passeport` | nvarchar | 35 | non |  | 0 |
| 16 | `date_fin_validite_passeport` | nvarchar | 8 | non |  | 0 |
| 17 | `numero_rue` | nvarchar | 10 | non |  | 0 |
| 18 | `nom_rue` | nvarchar | 30 | non |  | 0 |
| 19 | `commune` | nvarchar | 35 | non |  | 0 |
| 20 | `code_postal` | nvarchar | 10 | non |  | 0 |
| 21 | `ville` | nvarchar | 30 | non |  | 0 |
| 22 | `etat_province` | nvarchar | 10 | non |  | 0 |
| 23 | `pays_residence` | nvarchar | 3 | non |  | 0 |
| 24 | `ville_emission_visa` | nvarchar | 35 | non |  | 0 |
| 25 | `date_emission_visa` | nvarchar | 8 | non |  | 0 |
| 26 | `type_visa` | nvarchar | 35 | non |  | 0 |
| 27 | `millesia` | nvarchar | 1 | non |  | 0 |
| 28 | `liste_blanche` | nvarchar | 1 | non |  | 0 |
| 29 | `fumeur` | nvarchar | 1 | non |  | 0 |
| 30 | `nb_sejour_club` | nvarchar | 3 | non |  | 0 |
| 31 | `nb_sejour_village` | nvarchar | 3 | non |  | 0 |
| 32 | `type_client_accompagnant` | nvarchar | 1 | non |  | 0 |
| 33 | `numero_accompagnant` | nvarchar | 10 | non |  | 0 |
| 34 | `filiation_accompagnant` | nvarchar | 3 | non |  | 0 |
| 35 | `dossier` | nvarchar | 9 | non |  | 0 |
| 36 | `ordre_dossier` | nvarchar | 3 | non |  | 0 |
| 37 | `type_client_responsable_dette` | nvarchar | 1 | non |  | 0 |
| 38 | `numero_responsable_dette` | nvarchar | 9 | non |  | 0 |
| 39 | `seminaire` | nvarchar | 30 | non |  | 0 |
| 40 | `sexe` | nvarchar | 1 | non |  | 0 |
| 41 | `civilite` | nvarchar | 10 | non |  | 0 |
| 42 | `handicap` | nvarchar | 2 | non |  | 0 |
| 43 | `codpay` | nvarchar | 3 | non |  | 0 |
| 44 | `codnat` | nvarchar | 3 | non |  | 0 |
| 45 | `nation` | nvarchar | 3 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ide_IDX_1 | NONCLUSTERED | oui | dossier, ordre_dossier |

