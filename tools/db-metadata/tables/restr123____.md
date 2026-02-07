# restr123____

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `____code_vendeur` | int | 10 | non |  | 0 |
| 2 | `____num_mk3` | int | 10 | non |  | 0 |
| 3 | `____date_transaction` | char | 8 | non |  | 0 |
| 4 | `____time_transaction` | char | 6 | non |  | 0 |
| 5 | `____num_ticket` | int | 10 | non |  | 0 |
| 6 | `____num_carte` | int | 10 | non |  | 0 |
| 7 | `____signe` | nvarchar | 1 | non |  | 0 |
| 8 | `____code_article` | int | 10 | non |  | 0 |
| 9 | `____quantite` | int | 10 | non |  | 0 |
| 10 | `____prix_unitaire` | int | 10 | non |  | 0 |
| 11 | `____nom_personne` | nvarchar | 30 | non |  | 0 |
| 12 | `____prenom_personne` | nvarchar | 20 | non |  | 0 |
| 13 | `____num_adherent` | int | 10 | non |  | 0 |
| 14 | `____filiation` | int | 10 | non |  | 0 |
| 15 | `____flag_gratuite` | nvarchar | 1 | non |  | 0 |
| 16 | `____raison_gratuite` | nvarchar | 15 | non |  | 0 |
| 17 | `____historique` | nvarchar | 1 | non |  | 0 |
| 18 | `RowId_450` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| restr123_____IDX_2 | NONCLUSTERED | oui | RowId_450 |
| restr123_____IDX_1 | NONCLUSTERED | non | ____code_vendeur, ____num_mk3, ____date_transaction, ____time_transaction, ____num_ticket, ____num_carte, ____code_article |

