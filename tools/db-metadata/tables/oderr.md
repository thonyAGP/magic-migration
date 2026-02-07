# oderr

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 17 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type_erreur` | int | 10 | non |  | 0 |
| 2 | `date_transaction` | char | 8 | non |  | 0 |
| 3 | `time_transaction` | char | 6 | non |  | 0 |
| 4 | `date_post` | char | 8 | non |  | 0 |
| 5 | `time_post` | char | 6 | non |  | 0 |
| 6 | `code_article` | int | 10 | non |  | 0 |
| 7 | `descriptif_article` | nvarchar | 12 | non |  | 0 |
| 8 | `imputation` | nvarchar | 10 | non |  | 0 |
| 9 | `sous_imputation` | nvarchar | 3 | non |  | 0 |
| 10 | `quantite` | int | 10 | non |  | 0 |
| 11 | `montant` | float | 53 | non |  | 0 |
| 12 | `num_card` | nvarchar | 10 | non |  | 0 |
| 13 | `societe` | nvarchar | 1 | non |  | 0 |
| 14 | `compte` | int | 10 | non |  | 0 |
| 15 | `filiation` | int | 10 | non |  | 0 |
| 16 | `prix_unitaire` | float | 53 | non |  | 0 |
| 17 | `utilisateur` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| oderr_IDX_1 | NONCLUSTERED | oui | societe, compte, filiation, date_transaction, time_transaction, type_erreur |

