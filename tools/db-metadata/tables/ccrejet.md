# ccrejet

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 10 | non |  | 0 |
| 2 | `societe` | nvarchar | 1 | non |  | 0 |
| 3 | `code_8chiffres` | int | 10 | non |  | 0 |
| 4 | `filiation` | int | 10 | non |  | 0 |
| 5 | `nom_complet` | nvarchar | 30 | non |  | 0 |
| 6 | `prenom_complet` | nvarchar | 20 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ccrejet_IDX_1 | NONCLUSTERED | oui | utilisateur, societe, code_8chiffres, filiation |

