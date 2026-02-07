# caisse_session_article

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 0 |
| 2 | `chrono_session` | float | 53 | non |  | 0 |
| 3 | `chrono_detail` | int | 10 | non |  | 0 |
| 4 | `code_article` | int | 10 | non |  | 0 |
| 5 | `libelle_article` | nvarchar | 16 | non |  | 0 |
| 6 | `prix_unitaire` | float | 53 | non |  | 0 |
| 7 | `quantite` | int | 10 | non |  | 0 |
| 8 | `montant` | float | 53 | non |  | 0 |
| 9 | `date` | char | 8 | non |  | 0 |
| 10 | `heure` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_session_article_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail, code_article |

