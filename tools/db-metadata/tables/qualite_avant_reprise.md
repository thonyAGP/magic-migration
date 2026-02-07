# qualite_avant_reprise

**Nom logique Magic** : `qualite_avant_reprise`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `qur_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `qur_code_qualite` | nvarchar | 3 | non |  | 0 |
| 3 | `qur_compl_qualite` | nvarchar | 4 | non |  | 0 |
| 4 | `qur_libelle` | char | 24 | non |  | 0 |
| 5 | `qur_new_code_qualite` | nvarchar | 3 | non |  | 0 |
| 6 | `qur_new_compl_qualite` | nvarchar | 4 | non |  | 0 |
| 7 | `qur_qualite_reprise` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| qualite_avant_reprise_IDX_1 | NONCLUSTERED | oui | qur_societe, qur_code_qualite, qur_compl_qualite, qur_qualite_reprise |

