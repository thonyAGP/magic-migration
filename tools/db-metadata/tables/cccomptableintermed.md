# cccomptableintermed

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `code_gm_8_chiffres` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
| 4 | `type` | nvarchar | 2 | non |  | 0 |
| 5 | `couleur` | nvarchar | 20 | non |  | 0 |
| 6 | `qty` | int | 10 | non |  | 0 |
| 7 | `montant` | float | 53 | non |  | 0 |
| 8 | `date_comptable` | char | 8 | non |  | 0 |
| 9 | `date_operation` | char | 8 | non |  | 0 |
| 10 | `heure_operation` | char | 6 | non |  | 0 |
| 11 | `utilisateur` | nvarchar | 10 | non |  | 0 |
| 12 | `RowId_267` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cccomptableintermed_IDX_2 | NONCLUSTERED | non | type, utilisateur, date_comptable, couleur |
| cccomptableintermed_IDX_4 | NONCLUSTERED | oui | RowId_267 |
| cccomptableintermed_IDX_3 | NONCLUSTERED | non | societe, date_comptable, type, utilisateur, couleur |
| cccomptableintermed_IDX_1 | NONCLUSTERED | non | societe, code_gm_8_chiffres, filiation |

