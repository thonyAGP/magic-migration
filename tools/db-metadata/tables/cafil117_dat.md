# cafil117_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mor_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mor_devise` | nvarchar | 3 | non |  | 0 |
| 3 | `mor_type_operation` | nvarchar | 1 | non |  | 0 |
| 4 | `mor_mop` | nvarchar | 4 | non |  | 0 |
| 5 | `mor_accepte` | nvarchar | 1 | non |  | 0 |
| 6 | `mor_type_de_taux` | int | 10 | non |  | 0 |
| 7 | `mor_taux_de_change` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil117_dat_IDX_4 | NONCLUSTERED | oui | mor_societe, mor_type_operation, mor_type_de_taux, mor_devise, mor_mop |
| cafil117_dat_IDX_1 | NONCLUSTERED | oui | mor_societe, mor_devise, mor_type_operation, mor_mop, mor_type_de_taux |
| cafil117_dat_IDX_3 | NONCLUSTERED | oui | mor_societe, mor_mop, mor_type_operation, mor_accepte, mor_devise, mor_type_de_taux |
| cafil117_dat_IDX_2 | NONCLUSTERED | oui | mor_societe, mor_devise, mor_type_operation, mor_accepte, mor_mop, mor_type_de_taux |

